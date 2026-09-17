import test from 'node:test';
import assert from 'node:assert/strict';
import {
  XP_REWARDS,
  QUEST_RANKS,
  calculateLevel,
  calculateXPForLevel,
  getLevelProgress,
} from '../src/config/gamification.js';
import { CANONICAL_ACHIEVEMENTS } from '../src/config/achievements.js';
import { xpService } from '../src/services/gamification/xpService.js';
import { streakService } from '../src/services/gamification/streakService.js';
import { achievementService } from '../src/services/gamification/achievementService.js';

test('Stage 8: XP Configuration and Deterministic Level Math', () => {
  assert.equal(XP_REWARDS.LESSON_COMPLETION, 15);
  assert.equal(XP_REWARDS.MISSION_BEGINNER, 50);
  assert.equal(XP_REWARDS.COURSE_COMPLETION, 250);

  // Level 1: 0 to 49 XP
  assert.equal(calculateLevel(0), 1);
  assert.equal(calculateLevel(49), 1);

  // Level 2: 50 XP
  assert.equal(calculateLevel(50), 2);
  assert.equal(calculateXPForLevel(2), 50);

  // Level 3: 200 XP (50 * (3-1)^2 = 200)
  assert.equal(calculateLevel(200), 3);
  assert.equal(calculateXPForLevel(3), 200);

  // Progress helper
  const p1 = getLevelProgress(75);
  assert.equal(p1.currentLevel, 2);
  assert.equal(p1.rank, 'Novice');
  assert.equal(p1.xpInCurrentLevel, 25); // 75 - 50 = 25
  assert.equal(p1.xpNeededForNextLevel, 150); // 200 - 50 = 150
  assert.equal(p1.progressPercent, 17); // 25 / 150 ≈ 17%
});

test('Stage 8: Quest Ranks progression hierarchy', () => {
  assert.equal(QUEST_RANKS[0].title, 'Novice');
  assert.equal(QUEST_RANKS[1].title, 'Explorer');
  assert.equal(QUEST_RANKS[2].title, 'Tracer');
  assert.equal(QUEST_RANKS[3].title, 'Probe');
  assert.equal(QUEST_RANKS[4].title, 'Kernel Apprentice');
  assert.equal(QUEST_RANKS[5].title, 'Kernel Engineer');
});

test('Stage 8: XP Service awards XP and guarantees idempotency', async () => {
  const userId = `test-user-${Date.now()}`;

  // 1. First award succeeds
  const res1 = await xpService.awardXP({
    userId,
    amount: 50,
    reason: 'Completed mission: Observe a Process',
    sourceType: 'MISSION',
    sourceId: 'observe-a-process',
    rewardType: 'MISSION_COMPLETION',
  });

  assert.equal(res1.awarded, true);
  assert.equal(res1.amount, 50);

  // 2. Duplicate submission with exact same idempotency keys is rejected/ignored
  const res2 = await xpService.awardXP({
    userId,
    amount: 50,
    reason: 'Completed mission: Observe a Process',
    sourceType: 'MISSION',
    sourceId: 'observe-a-process',
    rewardType: 'MISSION_COMPLETION',
  });

  assert.equal(res2.awarded, false);
  assert.equal(res2.reason, 'ALREADY_AWARDED');

  // Total XP should still be 50, not 100
  const xpData = await xpService.getUserXP(userId);
  assert.equal(xpData.totalXP, 50);
  assert.equal(xpData.currentLevel, 2);
});

test('Stage 8: Learning Streak calculation and calendar-day deduplication', async () => {
  const userId = `streak-user-${Date.now()}`;

  // Day 1: First activity
  const now = new Date('2026-09-01T10:00:00Z');
  const s1 = await streakService.recordActivity(userId, now);
  assert.equal(s1.currentStreak, 1);

  // Same Day: Second activity does NOT increase streak
  const laterSameDay = new Date('2026-09-01T18:30:00Z');
  const s2 = await streakService.recordActivity(userId, laterSameDay);
  assert.equal(s2.currentStreak, 1);

  // Consecutive Day (Day 2): Streak increments to 2
  const nextDay = new Date('2026-09-02T12:00:00Z');
  const s3 = await streakService.recordActivity(userId, nextDay);
  assert.equal(s3.currentStreak, 2);

  // Gap (Day 5 - missed Day 3 & 4): Streak resets to 1
  const daysLater = new Date('2026-09-05T09:00:00Z');
  const s4 = await streakService.recordActivity(userId, daysLater);
  assert.equal(s4.currentStreak, 1);
  assert.equal(s4.longestStreak, 2); // Preserves personal best
});

test('Stage 8: Achievement Engine awards badges and prevents duplicate unlocks', async () => {
  const userId = `ach-user-${Date.now()}`;

  // 1. Initial achievements check
  const initial = await achievementService.getUserAchievements(userId);
  assert.equal(initial.length, CANONICAL_ACHIEVEMENTS.length);
  assert.ok(initial.every((a) => !a.isUnlocked));

  // 2. Completing first lesson triggers "First Steps"
  const unlocked = await achievementService.evaluateAchievements(userId, {
    type: 'LESSON',
    slug: 'what-is-linux',
    totalLessonsCompleted: 1,
  });

  assert.equal(unlocked.length, 1);
  assert.equal(unlocked[0].slug, 'first-steps');

  // 3. Completing another lesson does NOT unlock "First Steps" a second time
  const repeated = await achievementService.evaluateAchievements(userId, {
    type: 'LESSON',
    slug: 'kernel-architecture',
    totalLessonsCompleted: 2,
  });
  assert.equal(repeated.length, 0);

  // 4. Inspect unlocked status
  const updated = await achievementService.getUserAchievements(userId);
  const firstSteps = updated.find((a) => a.slug === 'first-steps');
  assert.equal(firstSteps.isUnlocked, true);
});