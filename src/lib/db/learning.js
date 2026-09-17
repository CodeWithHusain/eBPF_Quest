import { prisma } from './prisma.js';
import { contentService, allLessonsMap } from '../../services/contentService.js';
import { xpService } from '../../services/gamification/xpService.js';
import { streakService } from '../../services/gamification/streakService.js';
import { achievementService } from '../../services/gamification/achievementService.js';
import { XP_REWARDS } from '../../config/gamification.js';

/**
 * Server-side Learning & Progress Database Service
 * Provides robust, non-throwing methods for querying and updating user course progress.
 */

/**
 * Retrieves all lesson completion records for a specific user.
 * Returns an array of records with { lessonId, isCompleted, completedAt, lessonSlug, courseSlug }
 */
export async function getUserProgress(userId) {
  if (!userId || typeof userId !== 'string') return [];

  try {
    const records = await prisma.progress.findMany({
      where: {
        userId,
        isCompleted: true,
      },
      include: {
        lesson: {
          select: {
            id: true,
            slug: true,
            module: {
              select: {
                slug: true,
                course: {
                  select: {
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { completedAt: 'desc' },
    });

    return records.map((r) => ({
      id: r.id,
      lessonId: r.lessonId,
      isCompleted: r.isCompleted,
      completedAt: r.completedAt,
      lessonSlug: r.lesson?.slug || null,
      courseSlug: r.lesson?.module?.course?.slug || null,
    }));
  } catch (error) {
    console.error('[learning.getUserProgress] Database query failed:', error.message);
    return [];
  }
}

/**
 * Calculates real course progress statistics for a user.
 * Never fabricates numbers. If user is guest or has completed 0 lessons, completed is 0 and percent is 0.
 */
export async function getUserCourseProgress(userId, courseSlug) {
  const course = await contentService.getCourseBySlug(courseSlug);
  if (!course) {
    return {
      courseSlug,
      totalLessons: 0,
      completedLessons: 0,
      percentage: 0,
      isCompleted: false,
      completedLessonSlugs: [],
    };
  }

  // Flatten lessons from course definition
  const courseLessons = [];
  if (course.modules) {
    for (const mod of course.modules) {
      if (mod.lessons) {
        for (const l of mod.lessons) {
          courseLessons.push(l.slug);
        }
      }
    }
  }

  const totalLessons = courseLessons.length;
  if (totalLessons === 0 || !userId) {
    return {
      courseSlug,
      totalLessons,
      completedLessons: 0,
      percentage: 0,
      isCompleted: false,
      completedLessonSlugs: [],
    };
  }

  try {
    // Find all completed progress records for this user where lesson slug is in courseLessons
    const completedRecords = await prisma.progress.findMany({
      where: {
        userId,
        isCompleted: true,
        lesson: {
          slug: {
            in: courseLessons,
          },
        },
      },
      include: {
        lesson: {
          select: { slug: true },
        },
      },
    });

    const completedLessonSlugs = completedRecords.map((r) => r.lesson.slug);
    const completedCount = completedLessonSlugs.length;
    const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    return {
      courseSlug,
      totalLessons,
      completedLessons: completedCount,
      percentage,
      isCompleted: totalLessons > 0 && completedCount === totalLessons,
      completedLessonSlugs,
    };
  } catch (error) {
    console.error('[learning.getUserCourseProgress] Database error:', error.message);
    return {
      courseSlug,
      totalLessons,
      completedLessons: 0,
      percentage: 0,
      isCompleted: false,
      completedLessonSlugs: [],
    };
  }
}

/**
 * Marks a lesson as complete or incomplete for the specified user.
 * Resolves lessonId by slug (ensuring DB Lesson record exists or finds it).
 */
export async function markLessonComplete(userId, lessonSlug, completed = true) {
  if (!userId || !lessonSlug) {
    return { success: false, error: 'User ID and Lesson slug are required.' };
  }

  // Validate lesson exists in curriculum
  const lessonMeta = allLessonsMap[lessonSlug];
  if (!lessonMeta) {
    return { success: false, error: `Lesson '${lessonSlug}' does not exist.` };
  }

  try {
    // Find lesson in database by slug
    let dbLesson = await prisma.lesson.findFirst({
      where: { slug: lessonSlug },
    });

    // If lesson record is not yet seeded in DB, find or create course/module/lesson
    if (!dbLesson) {
      let dbCourse = await prisma.course.findUnique({
        where: { slug: lessonMeta.courseSlug },
      });

      if (!dbCourse) {
        dbCourse = await prisma.course.create({
          data: {
            slug: lessonMeta.courseSlug,
            title: 'Linux Fundamentals',
            description: 'Master Linux kernel fundamentals and systems programming.',
            isPublished: true,
          },
        });
      }

      let dbModule = await prisma.module.findFirst({
        where: {
          courseId: dbCourse.id,
          slug: lessonMeta.moduleSlug,
        },
      });

      if (!dbModule) {
        dbModule = await prisma.module.create({
          data: {
            courseId: dbCourse.id,
            slug: lessonMeta.moduleSlug,
            title: lessonMeta.moduleSlug.replace(/-/g, ' ').toUpperCase(),
          },
        });
      }

      dbLesson = await prisma.lesson.create({
        data: {
          moduleId: dbModule.id,
          slug: lessonSlug,
          title: lessonMeta.title,
          description: lessonMeta.description,
          difficulty: lessonMeta.difficulty || 'BEGINNER',
          estimatedMinutes: lessonMeta.estimatedMinutes || 15,
          isPublished: true,
        },
      });
    }

    // Upsert user progress
    const now = new Date();
    const progress = await prisma.progress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId: dbLesson.id,
        },
      },
      create: {
        userId,
        lessonId: dbLesson.id,
        isCompleted: completed,
        completedAt: completed ? now : null,
      },
      update: {
        isCompleted: completed,
        completedAt: completed ? now : null,
      },
    });

    let gamification = null;
    if (completed) {
      // 1. Award XP (Idempotent)
      const xpRes = await xpService.awardXP({
        userId,
        amount: XP_REWARDS.LESSON_COMPLETION,
        reason: `Completed lesson: ${lessonMeta.title}`,
        sourceType: 'LESSON',
        sourceId: lessonSlug,
        rewardType: 'LESSON_COMPLETION',
      });

      // 2. Record streak activity (Idempotent per calendar day)
      const streakRes = await streakService.recordActivity(userId);

      // 3. Evaluate total lessons and achievements
      const allCompleted = await getUserProgress(userId);
      const unlockedAchievements = await achievementService.evaluateAchievements(userId, {
        type: 'LESSON',
        slug: lessonSlug,
        totalLessonsCompleted: allCompleted.length,
      });

      gamification = {
        xpAwarded: xpRes.awarded ? xpRes.amount : 0,
        streak: streakRes?.currentStreak || 1,
        unlockedAchievements,
      };
    }

    return {
      success: true,
      lessonSlug,
      isCompleted: progress.isCompleted,
      completedAt: progress.completedAt,
      gamification,
    };
  } catch (error) {
    console.error('[learning.markLessonComplete] Error updating progress:', error.message);
    return { success: false, error: 'Database update failed.' };
  }
}

/**
 * Retrieves the user's recent learning activity (most recently completed lessons).
 */
export async function getRecentLearningActivity(userId, limit = 5) {
  if (!userId) return [];

  try {
    const recent = await prisma.progress.findMany({
      where: {
        userId,
        isCompleted: true,
      },
      include: {
        lesson: {
          include: {
            module: {
              include: {
                course: true,
              },
            },
          },
        },
      },
      orderBy: { completedAt: 'desc' },
      take: limit,
    });

    return recent.map((r) => ({
      lessonSlug: r.lesson.slug,
      lessonTitle: r.lesson.title,
      moduleTitle: r.lesson.module?.title || '',
      courseTitle: r.lesson.module?.course?.title || '',
      courseSlug: r.lesson.module?.course?.slug || '',
      completedAt: r.completedAt,
    }));
  } catch (error) {
    console.error('[learning.getRecentLearningActivity] Database error:', error.message);
    return [];
  }
}
