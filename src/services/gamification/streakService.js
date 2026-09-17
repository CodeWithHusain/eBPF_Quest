import { prisma } from '../../lib/db/prisma.js';

/**
 * Stage 8: Learning Streak Service
 *
 * Tracks consecutive calendar days of meaningful technical learning activity.
 * Strict time-normalization to UTC midnight ensures resistance to midnight jitter.
 * Same-day activities NEVER increment streaks multiple times.
 */

const inMemoryStreaks = new Map(); // userId -> streak object

function toUtcMidnight(date = new Date()) {
  const d = new Date(date);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

export const streakService = {
  /**
   * Records a qualified learning action for the user's streak.
   */
  async recordActivity(userId, activityDate = new Date()) {
    if (!userId) return null;

    const todayUtc = toUtcMidnight(activityDate);
    const oneDayMs = 24 * 60 * 60 * 1000;

    try {
      let streak = await prisma.userStreak.findUnique({
        where: { userId },
      });

      if (!streak) {
        // First activity ever
        streak = await prisma.userStreak.create({
          data: {
            userId,
            currentStreak: 1,
            longestStreak: 1,
            lastActivityDate: todayUtc,
          },
        });
        return streak;
      }

      if (!streak.lastActivityDate) {
        streak = await prisma.userStreak.update({
          where: { userId },
          data: {
            currentStreak: 1,
            longestStreak: Math.max(1, streak.longestStreak),
            lastActivityDate: todayUtc,
          },
        });
        return streak;
      }

      const lastUtc = toUtcMidnight(streak.lastActivityDate);
      const diffDays = Math.round((todayUtc.getTime() - lastUtc.getTime()) / oneDayMs);

      if (diffDays === 0) {
        // Same calendar day: do nothing (idempotent, no duplicate increment)
        return streak;
      }

      if (diffDays === 1) {
        // Consecutive calendar day: increment streak
        const newCurrent = streak.currentStreak + 1;
        const newLongest = Math.max(newCurrent, streak.longestStreak);

        streak = await prisma.userStreak.update({
          where: { userId },
          data: {
            currentStreak: newCurrent,
            longestStreak: newLongest,
            lastActivityDate: todayUtc,
          },
        });
        return streak;
      }

      // Gap of 2 or more days: reset current streak to 1
      streak = await prisma.userStreak.update({
        where: { userId },
        data: {
          currentStreak: 1,
          lastActivityDate: todayUtc,
        },
      });
      return streak;
    } catch (err) {
      // In-memory fallback
      let s = inMemoryStreaks.get(userId);
      if (!s) {
        s = { userId, currentStreak: 1, longestStreak: 1, lastActivityDate: todayUtc };
        inMemoryStreaks.set(userId, s);
        return s;
      }

      const lastUtc = toUtcMidnight(s.lastActivityDate);
      const diffDays = Math.round((todayUtc.getTime() - lastUtc.getTime()) / oneDayMs);

      if (diffDays === 0) {
        return s;
      }

      if (diffDays === 1) {
        s.currentStreak += 1;
        s.longestStreak = Math.max(s.currentStreak, s.longestStreak);
        s.lastActivityDate = todayUtc;
        return s;
      }

      s.currentStreak = 1;
      s.lastActivityDate = todayUtc;
      return s;
    }
  },

  /**
   * Retrieves the current streak status for a user.
   */
  async getUserStreak(userId) {
    if (!userId) {
      return { currentStreak: 0, longestStreak: 0, lastActivityDate: null, isActiveToday: false };
    }

    try {
      const streak = await prisma.userStreak.findUnique({
        where: { userId },
      });

      if (!streak) {
        return { currentStreak: 0, longestStreak: 0, lastActivityDate: null, isActiveToday: false };
      }

      const todayUtc = toUtcMidnight();
      const lastUtc = streak.lastActivityDate ? toUtcMidnight(streak.lastActivityDate) : null;
      const isActiveToday = lastUtc && lastUtc.getTime() === todayUtc.getTime();

      // Check if streak broke yesterday
      const oneDayMs = 24 * 60 * 60 * 1000;
      const diffDays = lastUtc ? Math.round((todayUtc.getTime() - lastUtc.getTime()) / oneDayMs) : 999;
      const effectiveCurrent = diffDays > 1 ? 0 : streak.currentStreak;

      return {
        currentStreak: effectiveCurrent,
        longestStreak: streak.longestStreak,
        lastActivityDate: streak.lastActivityDate,
        isActiveToday: Boolean(isActiveToday),
      };
    } catch (err) {
      const s = inMemoryStreaks.get(userId);
      if (!s) return { currentStreak: 0, longestStreak: 0, lastActivityDate: null, isActiveToday: false };

      const todayUtc = toUtcMidnight();
      const lastUtc = s.lastActivityDate ? toUtcMidnight(s.lastActivityDate) : null;
      const isActiveToday = lastUtc && lastUtc.getTime() === todayUtc.getTime();
      const oneDayMs = 24 * 60 * 60 * 1000;
      const diffDays = lastUtc ? Math.round((todayUtc.getTime() - lastUtc.getTime()) / oneDayMs) : 999;

      return {
        currentStreak: diffDays > 1 ? 0 : s.currentStreak,
        longestStreak: s.longestStreak,
        lastActivityDate: s.lastActivityDate,
        isActiveToday: Boolean(isActiveToday),
      };
    }
  },
};

export default streakService;