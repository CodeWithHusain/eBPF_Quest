import { prisma } from './prisma.js';
import { missionService, allMissionsMap } from '../../services/missionService.js';
import { validateSubmission, ValidationStatus } from '../validation/missionValidator.js';
import { getUserProgress } from './learning.js';
import { xpService } from '../../services/gamification/xpService.js';
import { streakService } from '../../services/gamification/streakService.js';
import { achievementService } from '../../services/gamification/achievementService.js';
import { XP_REWARDS } from '../../config/gamification.js';

/**
 * Server-side Missions Database Service Layer
 * Encapsulates all Prisma database operations for mission attempts, completions, and progress.
 */

/**
 * Retrieves the status map of all missions for a specific user.
 * Returns an object keyed by missionSlug with { status: 'NOT_STARTED'|'IN_PROGRESS'|'COMPLETED', completedAt, startedAt }
 */
export async function getUserMissionsStatus(userId) {
  if (!userId || typeof userId !== 'string') {
    return {};
  }

  try {
    // 1. Fetch all completions
    const completions = await prisma.missionCompletion.findMany({
      where: { userId },
      include: { mission: { select: { slug: true } } },
    });

    // 2. Fetch all active attempts
    const attempts = await prisma.missionAttempt.findMany({
      where: { userId },
      include: { mission: { select: { slug: true } } },
      orderBy: { startedAt: 'desc' },
    });

    const statusMap = {};

    // Populate attempts
    for (const att of attempts) {
      const slug = att.mission?.slug;
      if (slug && !statusMap[slug]) {
        statusMap[slug] = {
          status: att.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS',
          startedAt: att.startedAt,
          attemptId: att.id,
        };
      }
    }

    // Overwrite with confirmed completions
    for (const comp of completions) {
      const slug = comp.mission?.slug;
      if (slug) {
        statusMap[slug] = {
          status: 'COMPLETED',
          completedAt: comp.completedAt,
          score: comp.score,
        };
      }
    }

    return statusMap;
  } catch (error) {
    console.error('[missions.getUserMissionsStatus] Database error:', error.message);
    return {};
  }
}

/**
 * Retrieves a single mission by slug along with real user attempt & completion status.
 */
export async function getMissionWithUserStatus(missionSlug, userId = null) {
  const missionMeta = await missionService.getMissionBySlug(missionSlug);
  if (!missionMeta) return null;

  let userStatus = {
    status: 'NOT_STARTED',
    attempt: null,
    completion: null,
    prerequisitesStatus: [],
  };

  if (!userId) {
    return {
      ...missionMeta,
      userStatus,
    };
  }

  try {
    // Check completion
    const completion = await prisma.missionCompletion.findFirst({
      where: {
        userId,
        mission: { slug: missionSlug },
      },
    });

    // Check latest attempt
    const attempt = await prisma.missionAttempt.findFirst({
      where: {
        userId,
        mission: { slug: missionSlug },
      },
      orderBy: { startedAt: 'desc' },
    });

    // Evaluate prerequisites against user completed lessons
    const userLessonRecords = await getUserProgress(userId);
    const completedLessonSlugs = userLessonRecords.map((r) => r.lessonSlug);

    const prerequisitesStatus = (missionMeta.prerequisites || []).map((req) => {
      const isMet =
        req.type === 'LESSON'
          ? completedLessonSlugs.includes(req.targetSlug)
          : req.type === 'COURSE'
          ? completedLessonSlugs.length > 0 // Informational indication
          : false;

      return {
        ...req,
        isMet,
      };
    });

    if (completion) {
      userStatus = {
        status: 'COMPLETED',
        attempt,
        completion,
        prerequisitesStatus,
      };
    } else if (attempt && attempt.status === 'IN_PROGRESS') {
      userStatus = {
        status: 'IN_PROGRESS',
        attempt,
        completion: null,
        prerequisitesStatus,
      };
    } else {
      userStatus = {
        status: 'NOT_STARTED',
        attempt: null,
        completion: null,
        prerequisitesStatus,
      };
    }

    return {
      ...missionMeta,
      userStatus,
    };
  } catch (error) {
    console.error('[missions.getMissionWithUserStatus] Database error:', error.message);
    return {
      ...missionMeta,
      userStatus,
    };
  }
}

/**
 * Ensures the Mission record exists in the database.
 */
async function ensureDbMission(missionMeta) {
  let dbMission = await prisma.mission.findUnique({
    where: { slug: missionMeta.slug },
  });

  if (!dbMission) {
    dbMission = await prisma.mission.create({
      data: {
        slug: missionMeta.slug,
        title: missionMeta.title,
        shortDescription: missionMeta.shortDescription || '',
        description: missionMeta.description,
        story: missionMeta.story || '',
        instructions: missionMeta.instructions || '',
        successCriteria: missionMeta.successCriteria || '',
        difficulty: missionMeta.difficulty || 'BEGINNER',
        category: missionMeta.category || 'LINUX',
        estimatedMinutes: missionMeta.estimatedMinutes || 15,
        points: missionMeta.points || 100,
        order: missionMeta.order || 0,
        isPublished: missionMeta.isPublished || false,
      },
    });
  }

  return dbMission;
}

/**
 * Starts a mission attempt for the authenticated user.
 */
export async function startMissionAttempt(userId, missionSlug) {
  if (!userId || !missionSlug) {
    return { success: false, error: 'User ID and mission slug are required.' };
  }

  const missionMeta = allMissionsMap[missionSlug];
  if (!missionMeta) {
    return { success: false, error: `Mission '${missionSlug}' not found.` };
  }

  try {
    const dbMission = await ensureDbMission(missionMeta);

    // Check if there is already an active attempt
    let attempt = await prisma.missionAttempt.findFirst({
      where: {
        userId,
        missionId: dbMission.id,
        status: 'IN_PROGRESS',
      },
    });

    if (!attempt) {
      attempt = await prisma.missionAttempt.create({
        data: {
          userId,
          missionId: dbMission.id,
          status: 'IN_PROGRESS',
          startedAt: new Date(),
        },
      });
    }

    return {
      success: true,
      missionSlug,
      attemptId: attempt.id,
      status: attempt.status,
    };
  } catch (error) {
    console.error('[missions.startMissionAttempt] Database error:', error.message);
    return { success: false, error: 'Failed to start mission attempt.' };
  }
}

/**
 * Submits a solution for a mission attempt and evaluates with the mock validator.
 */
export async function submitMissionAttempt(userId, missionSlug, payload = {}) {
  if (!userId || !missionSlug) {
    return { success: false, error: 'User ID and mission slug are required.' };
  }

  const missionMeta = allMissionsMap[missionSlug];
  if (!missionMeta) {
    return { success: false, error: `Mission '${missionSlug}' not found.` };
  }

  try {
    const dbMission = await ensureDbMission(missionMeta);

    // Find or create active attempt
    let attempt = await prisma.missionAttempt.findFirst({
      where: {
        userId,
        missionId: dbMission.id,
        status: 'IN_PROGRESS',
      },
      orderBy: { startedAt: 'desc' },
    });

    if (!attempt) {
      attempt = await prisma.missionAttempt.create({
        data: {
          userId,
          missionId: dbMission.id,
          status: 'IN_PROGRESS',
          startedAt: new Date(),
        },
      });
    }

    // Run through safe validator
    const validationResult = await validateSubmission({
      missionSlug,
      payload,
      userId,
    });

    const now = new Date();

    if (validationResult.status === ValidationStatus.PASS) {
      // Update attempt to completed
      await prisma.missionAttempt.update({
        where: { id: attempt.id },
        data: {
          status: 'COMPLETED',
          submittedAt: now,
          completedAt: now,
        },
      });

      // Upsert MissionCompletion record
      await prisma.missionCompletion.upsert({
        where: {
          userId_missionId: {
            userId,
            missionId: dbMission.id,
          },
        },
        create: {
          userId,
          missionId: dbMission.id,
          score: validationResult.score || missionMeta.points || 100,
          completedAt: now,
        },
        update: {
          completedAt: now,
          score: validationResult.score || missionMeta.points || 100,
        },
      });

      // Record Submission entry for audit logging
      await prisma.submission.create({
        data: {
          userId,
          missionId: dbMission.id,
          status: 'PASSED',
          score: validationResult.score || 100,
          output: validationResult.feedback,
        },
      });

      // 1. Award XP for Mission Completion (Idempotent)
      const missionPoints = missionMeta.points || XP_REWARDS.MISSION_BEGINNER;
      const xpRes = await xpService.awardXP({
        userId,
        amount: missionPoints,
        reason: `Completed mission: ${missionMeta.title}`,
        sourceType: 'MISSION',
        sourceId: missionSlug,
        rewardType: 'MISSION_COMPLETION',
      });

      // 2. Record Streak Activity (Idempotent per calendar day)
      const streakRes = await streakService.recordActivity(userId);

      // 3. Count total missions completed & Evaluate Achievements
      const userCompletions = await prisma.missionCompletion.count({ where: { userId } }).catch(() => 1);
      const unlockedAchievements = await achievementService.evaluateAchievements(userId, {
        type: 'MISSION',
        slug: missionSlug,
        totalMissionsCompleted: userCompletions,
      });

      return {
        success: true,
        passed: true,
        status: ValidationStatus.PASS,
        feedback: validationResult.feedback,
        passedObjectives: validationResult.passedObjectives,
        gamification: {
          xpAwarded: xpRes.awarded ? xpRes.amount : 0,
          streak: streakRes?.currentStreak || 1,
          unlockedAchievements,
        },
      };
    } else {
      // Record failed attempt submission
      await prisma.missionAttempt.update({
        where: { id: attempt.id },
        data: {
          submittedAt: now,
        },
      });

      await prisma.submission.create({
        data: {
          userId,
          missionId: dbMission.id,
          status: 'FAILED',
          score: 0,
          output: validationResult.feedback,
        },
      });

      return {
        success: true,
        passed: false,
        status: ValidationStatus.FAIL,
        feedback: validationResult.feedback,
        passedObjectives: validationResult.passedObjectives || [],
      };
    }
  } catch (error) {
    console.error('[missions.submitMissionAttempt] Database error:', error.message);
    return {
      success: false,
      error: 'Submission processing failed.',
      status: ValidationStatus.ERROR,
    };
  }
}

/**
 * Returns overall mission statistics for the authenticated dashboard.
 */
export async function getUserMissionStats(userId) {
  if (!userId) {
    return {
      completedCount: 0,
      inProgressCount: 0,
      recentMissions: [],
    };
  }

  try {
    const completions = await prisma.missionCompletion.findMany({
      where: { userId },
      include: { mission: true },
      orderBy: { completedAt: 'desc' },
    });

    const activeAttempts = await prisma.missionAttempt.findMany({
      where: {
        userId,
        status: 'IN_PROGRESS',
      },
      include: { mission: true },
    });

    const completedMissionIds = new Set(completions.map((c) => c.missionId));
    const uncompletedActive = activeAttempts.filter(
      (a) => !completedMissionIds.has(a.missionId)
    );

    return {
      completedCount: completions.length,
      inProgressCount: uncompletedActive.length,
      recentMissions: completions.slice(0, 5).map((c) => ({
        slug: c.mission.slug,
        title: c.mission.title,
        completedAt: c.completedAt,
        category: c.mission.category,
      })),
      inProgressMissions: uncompletedActive.slice(0, 5).map((a) => ({
        slug: a.mission.slug,
        title: a.mission.title,
        startedAt: a.startedAt,
        category: a.mission.category,
      })),
    };
  } catch (error) {
    console.error('[missions.getUserMissionStats] Database error:', error.message);
    return {
      completedCount: 0,
      inProgressCount: 0,
      recentMissions: [],
      inProgressMissions: [],
    };
  }
}
