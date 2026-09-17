import { prisma } from '../../lib/db/prisma.js';
import { CANONICAL_ACHIEVEMENTS } from '../../config/achievements.js';
import { xpService } from './xpService.js';

/**
 * Stage 8: Achievement Engine
 *
 * Evaluates technical milestones server-side and awards achievements idempotently.
 * Strictly prevents duplicate unlocks via DB unique constraint [userId, achievementId].
 */

const inMemoryUserAchievements = new Map(); // key: `${userId}:${slug}` -> record

export const achievementService = {
  /**
   * Evaluates user milestone events (lesson completion, mission pass, course finish).
   */
  async evaluateAchievements(userId, { type, slug, totalLessonsCompleted = 0, totalMissionsCompleted = 0 }) {
    if (!userId) return [];

    const unlockedNow = [];

    // Rule 1: First Steps (First lesson ever completed)
    if (type === 'LESSON' && totalLessonsCompleted >= 1) {
      const res = await this.unlockAchievement(userId, 'first-steps');
      if (res.unlocked) unlockedNow.push(res.achievement);
    }

    // Rule 2: Linux Explorer (All 23 lessons of Linux Fundamentals completed)
    if (type === 'COURSE' && slug === 'linux-fundamentals') {
      const res = await this.unlockAchievement(userId, 'linux-explorer');
      if (res.unlocked) unlockedNow.push(res.achievement);
    }

    // Rule 3: Mission Accepted (First mission ever solved)
    if (type === 'MISSION' && totalMissionsCompleted >= 1) {
      const res = await this.unlockAchievement(userId, 'mission-accepted');
      if (res.unlocked) unlockedNow.push(res.achievement);
    }

    // Rule 4: Specific Mission Badges
    if (type === 'MISSION') {
      if (slug === 'observe-a-process') {
        const res = await this.unlockAchievement(userId, 'process-sleuth');
        if (res.unlocked) unlockedNow.push(res.achievement);
      } else if (slug === 'explore-file-descriptors') {
        const res = await this.unlockAchievement(userId, 'file-investigator');
        if (res.unlocked) unlockedNow.push(res.achievement);
      } else if (slug === 'find-a-network-interface') {
        const res = await this.unlockAchievement(userId, 'net-navigator');
        if (res.unlocked) unlockedNow.push(res.achievement);
      } else if (slug === 'trace-a-process-event') {
        const res = await this.unlockAchievement(userId, 'tracer');
        if (res.unlocked) unlockedNow.push(res.achievement);
      } else if (slug === 'first-ebpf-program') {
        const res = await this.unlockAchievement(userId, 'first-bpf-verifier');
        if (res.unlocked) unlockedNow.push(res.achievement);
      }
    }

    return unlockedNow;
  },

  /**
   * Atomically unlocks an achievement for a user and awards its bonus XP.
   */
  async unlockAchievement(userId, achievementSlug) {
    const meta = CANONICAL_ACHIEVEMENTS.find((a) => a.slug === achievementSlug);
    if (!meta) return { unlocked: false, reason: 'NOT_FOUND' };

    try {
      // Ensure Achievement definition exists in DB
      let dbAch = await prisma.achievement.findUnique({
        where: { slug: achievementSlug },
      });

      if (!dbAch) {
        dbAch = await prisma.achievement.create({
          data: {
            slug: meta.slug,
            title: meta.title,
            description: meta.description,
            category: meta.category,
            icon: meta.icon,
            xpReward: meta.xpReward,
            requirement: meta.requirement,
            isHidden: meta.isHidden,
            order: meta.order,
          },
        });
      }

      // Create UserAchievement record
      const userAch = await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: dbAch.id,
        },
      });

      // Award achievement bonus XP
      if (meta.xpReward > 0) {
        await xpService.awardXP({
          userId,
          amount: meta.xpReward,
          reason: `Unlocked achievement: ${meta.title}`,
          sourceType: 'ACHIEVEMENT',
          sourceId: meta.slug,
          rewardType: 'ACHIEVEMENT_UNLOCK',
        });
      }

      return {
        unlocked: true,
        achievement: {
          ...meta,
          unlockedAt: userAch.unlockedAt,
        },
      };
    } catch (err) {
      // Unique constraint violation -> Already unlocked
      if (err.code === 'P2002' || err.message?.includes('unique constraint') || err.message?.includes('Unique constraint failed')) {
        return { unlocked: false, reason: 'ALREADY_UNLOCKED' };
      }

      // In-memory fallback
      const memKey = `${userId}:${achievementSlug}`;
      if (inMemoryUserAchievements.has(memKey)) {
        return { unlocked: false, reason: 'ALREADY_UNLOCKED' };
      }

      const record = {
        userId,
        achievementId: meta.slug,
        unlockedAt: new Date(),
      };
      inMemoryUserAchievements.set(memKey, record);

      if (meta.xpReward > 0) {
        await xpService.awardXP({
          userId,
          amount: meta.xpReward,
          reason: `Unlocked achievement: ${meta.title}`,
          sourceType: 'ACHIEVEMENT',
          sourceId: meta.slug,
          rewardType: 'ACHIEVEMENT_UNLOCK',
        });
      }

      return {
        unlocked: true,
        achievement: {
          ...meta,
          unlockedAt: record.unlockedAt,
        },
      };
    }
  },

  /**
   * Returns all canonical achievements merged with user's unlock timestamps.
   */
  async getUserAchievements(userId) {
    let unlockedMap = new Map();

    if (userId) {
      try {
        const records = await prisma.userAchievement.findMany({
          where: { userId },
          include: { achievement: true },
        });

        for (const r of records) {
          unlockedMap.set(r.achievement.slug, r.unlockedAt);
        }
      } catch (err) {
        // In-memory fallback
        for (const [key, val] of inMemoryUserAchievements.entries()) {
          const [uId, slug] = key.split(':');
          if (uId === userId) {
            unlockedMap.set(slug, val.unlockedAt);
          }
        }
      }
    }

    return CANONICAL_ACHIEVEMENTS.map((ach) => {
      const isUnlocked = unlockedMap.has(ach.slug);
      return {
        ...ach,
        isUnlocked,
        unlockedAt: unlockedMap.get(ach.slug) || null,
        requirement: ach.isHidden && !isUnlocked ? 'Secret milestone' : ach.requirement,
      };
    });
  },
};

export default achievementService;