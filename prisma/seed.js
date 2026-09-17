import { PrismaClient } from '@prisma/client';
import { allCurriculumCourses } from '../src/services/contentService.js';
import { allLessonsMap } from '../src/services/contentService.js';
import { allMissions } from '../src/services/missionService.js';
import { CANONICAL_ACHIEVEMENTS } from '../src/config/achievements.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding BPFQuest Curriculum into database...');

  // 1. Seed Courses, Modules, and Lessons
  for (let i = 0; i < allCurriculumCourses.length; i++) {
    const courseData = allCurriculumCourses[i];
    console.log(`- Upserting Course: ${courseData.title} (${courseData.slug})`);

    const course = await prisma.course.upsert({
      where: { slug: courseData.slug },
      update: {
        title: courseData.title,
        shortDescription: courseData.shortDescription || courseData.tagline || '',
        description: courseData.description,
        difficulty: courseData.difficulty,
        estimatedHours: courseData.estimatedHours || 4,
        order: i + 1,
        isPublished: courseData.isPublished || false,
      },
      create: {
        slug: courseData.slug,
        title: courseData.title,
        shortDescription: courseData.shortDescription || courseData.tagline || '',
        description: courseData.description,
        difficulty: courseData.difficulty,
        estimatedHours: courseData.estimatedHours || 4,
        order: i + 1,
        isPublished: courseData.isPublished || false,
      },
    });

    if (courseData.modules && courseData.modules.length > 0) {
      for (let m = 0; m < courseData.modules.length; m++) {
        const modData = courseData.modules[m];

        const module = await prisma.module.upsert({
          where: {
            courseId_slug: {
              courseId: course.id,
              slug: modData.slug,
            },
          },
          update: {
            title: modData.title,
            description: modData.description || '',
            order: m + 1,
          },
          create: {
            courseId: course.id,
            slug: modData.slug,
            title: modData.title,
            description: modData.description || '',
            order: m + 1,
          },
        });

        if (modData.lessons && modData.lessons.length > 0) {
          for (let l = 0; l < modData.lessons.length; l++) {
            const lessonSummary = modData.lessons[l];
            const fullLesson = allLessonsMap[lessonSummary.slug] || lessonSummary;

            await prisma.lesson.upsert({
              where: {
                moduleId_slug: {
                  moduleId: module.id,
                  slug: lessonSummary.slug,
                },
              },
              update: {
                title: fullLesson.title,
                description: fullLesson.description || '',
                difficulty: fullLesson.difficulty || 'BEGINNER',
                estimatedMinutes: fullLesson.estimatedMinutes || 15,
                order: l + 1,
                content: fullLesson.content ? fullLesson.content.slice(0, 1000) : null,
                isPublished: true,
              },
              create: {
                moduleId: module.id,
                slug: lessonSummary.slug,
                title: fullLesson.title,
                description: fullLesson.description || '',
                difficulty: fullLesson.difficulty || 'BEGINNER',
                estimatedMinutes: fullLesson.estimatedMinutes || 15,
                order: l + 1,
                content: fullLesson.content ? fullLesson.content.slice(0, 1000) : null,
                isPublished: true,
              },
            });
          }
        }
      }
    }
  }

  // 2. Seed Hands-on Missions (Stage 5)
  console.log('\nSeeding Hands-on Missions into database...');
  for (let i = 0; i < allMissions.length; i++) {
    const missionData = allMissions[i];
    console.log(`- Upserting Mission: ${missionData.title} (${missionData.slug})`);

    let dbLessonId = null;
    if (missionData.lessonSlug) {
      const dbLesson = await prisma.lesson.findFirst({
        where: { slug: missionData.lessonSlug },
      });
      if (dbLesson) dbLessonId = dbLesson.id;
    }

    const mission = await prisma.mission.upsert({
      where: { slug: missionData.slug },
      update: {
        title: missionData.title,
        shortDescription: missionData.shortDescription || '',
        description: missionData.description,
        story: missionData.story || '',
        instructions: missionData.instructions || '',
        successCriteria: missionData.successCriteria || '',
        difficulty: missionData.difficulty,
        category: missionData.category,
        estimatedMinutes: missionData.estimatedMinutes,
        points: missionData.points || 100,
        order: missionData.order || i + 1,
        isPublished: missionData.isPublished || false,
        lessonId: dbLessonId,
      },
      create: {
        slug: missionData.slug,
        title: missionData.title,
        shortDescription: missionData.shortDescription || '',
        description: missionData.description,
        story: missionData.story || '',
        instructions: missionData.instructions || '',
        successCriteria: missionData.successCriteria || '',
        difficulty: missionData.difficulty,
        category: missionData.category,
        estimatedMinutes: missionData.estimatedMinutes,
        points: missionData.points || 100,
        order: missionData.order || i + 1,
        isPublished: missionData.isPublished || false,
        lessonId: dbLessonId,
      },
    });

    // Objectives
    if (missionData.objectives && missionData.objectives.length > 0) {
      await prisma.missionObjective.deleteMany({ where: { missionId: mission.id } });
      for (let o = 0; o < missionData.objectives.length; o++) {
        const obj = missionData.objectives[o];
        await prisma.missionObjective.create({
          data: {
            missionId: mission.id,
            title: obj.title,
            description: obj.description || '',
            order: obj.order || o + 1,
            validationKey: obj.validationKey,
          },
        });
      }
    }

    // Hints
    if (missionData.hints && missionData.hints.length > 0) {
      await prisma.missionHint.deleteMany({ where: { missionId: mission.id } });
      for (let h = 0; h < missionData.hints.length; h++) {
        const hint = missionData.hints[h];
        await prisma.missionHint.create({
          data: {
            missionId: mission.id,
            order: hint.order || h + 1,
            title: hint.title,
            content: hint.content,
          },
        });
      }
    }

    // Prerequisites
    if (missionData.prerequisites && missionData.prerequisites.length > 0) {
      await prisma.missionPrerequisite.deleteMany({ where: { missionId: mission.id } });
      for (let p = 0; p < missionData.prerequisites.length; p++) {
        const prereq = missionData.prerequisites[p];
        await prisma.missionPrerequisite.create({
          data: {
            missionId: mission.id,
            type: prereq.type || 'LESSON',
            targetSlug: prereq.targetSlug,
            title: prereq.title,
            order: prereq.order || p + 1,
          },
        });
      }
    }
  }

  // 3. Seed Achievements (Stage 8)
  console.log('\nSeeding Technical Achievements into database...');
  for (let i = 0; i < CANONICAL_ACHIEVEMENTS.length; i++) {
    const ach = CANONICAL_ACHIEVEMENTS[i];
    console.log(`- Upserting Achievement: ${ach.title} (${ach.slug})`);

    await prisma.achievement.upsert({
      where: { slug: ach.slug },
      update: {
        title: ach.title,
        description: ach.description,
        category: ach.category,
        icon: ach.icon,
        xpReward: ach.xpReward,
        requirement: ach.requirement,
        isHidden: ach.isHidden,
        order: ach.order,
      },
      create: {
        slug: ach.slug,
        title: ach.title,
        description: ach.description,
        category: ach.category,
        icon: ach.icon,
        xpReward: ach.xpReward,
        requirement: ach.requirement,
        isHidden: ach.isHidden,
        order: ach.order,
      },
    });
  }

  console.log('\n✓ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
