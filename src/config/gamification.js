/**
 * Stage 8: Gamification, XP & Progression Configuration
 *
 * All XP rewards, level boundaries, and quest rank labels are centrally defined here.
 * Untrusted clients CANNOT modify or specify XP amounts.
 */

export const XP_REWARDS = {
  LESSON_COMPLETION: 15,
  KNOWLEDGE_CHECK: 10,
  MISSION_BEGINNER: 50,
  MISSION_INTERMEDIATE: 100,
  MISSION_ADVANCED: 200,
  COURSE_COMPLETION: 250,
  PLAYGROUND_SUCCESS: 25,
};

/**
 * Platform Progression Ranks (purely within BPFQuest, never marketed as certifications)
 */
export const QUEST_RANKS = [
  { minLevel: 1, maxLevel: 2, title: 'Novice', description: 'Beginning systems & Linux explorer' },
  { minLevel: 3, maxLevel: 4, title: 'Explorer', description: 'Proficient in Linux processes, memory, and virtual filesystems' },
  { minLevel: 5, maxLevel: 6, title: 'Tracer', description: 'Skilled in ftrace, perf events, and system call probes' },
  { minLevel: 7, maxLevel: 8, title: 'Probe', description: 'Writing custom eBPF probes, filters, and maps' },
  { minLevel: 9, maxLevel: 11, title: 'Kernel Apprentice', description: 'Deep in XDP packet processing and kernel subsystems' },
  { minLevel: 12, maxLevel: 999, title: 'Kernel Engineer', description: 'Systems mastery across eBPF runtime, verifier, and JIT' },
];

/**
 * Deterministic Level Formula
 * Level L = floor(sqrt(totalXP / 50)) + 1
 */
export function calculateLevel(totalXP = 0) {
  if (totalXP <= 0) return 1;
  return Math.floor(Math.sqrt(totalXP / 50)) + 1;
}

/**
 * Calculates total XP threshold required to reach level L
 */
export function calculateXPForLevel(level = 1) {
  if (level <= 1) return 0;
  return 50 * Math.pow(level - 1, 2);
}

/**
 * Returns level progress details: current level, XP within current level,
 * XP required to reach next level, and progress percentage.
 */
export function getLevelProgress(totalXP = 0) {
  const currentLevel = calculateLevel(totalXP);
  const currentLevelBaseXP = calculateXPForLevel(currentLevel);
  const nextLevelBaseXP = calculateXPForLevel(currentLevel + 1);

  const xpInCurrentLevel = Math.max(0, totalXP - currentLevelBaseXP);
  const xpNeededForNextLevel = nextLevelBaseXP - currentLevelBaseXP;
  const progressPercent = Math.min(100, Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100));

  const rank = QUEST_RANKS.find((r) => currentLevel >= r.minLevel && currentLevel <= r.maxLevel) || QUEST_RANKS[QUEST_RANKS.length - 1];

  return {
    totalXP,
    currentLevel,
    rank: rank.title,
    rankDescription: rank.description,
    xpInCurrentLevel,
    xpNeededForNextLevel,
    nextLevelBaseXP,
    progressPercent,
  };
}