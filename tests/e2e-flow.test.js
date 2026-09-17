import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateLevel, getLevelProgress, XP_REWARDS } from '../src/config/gamification.js';
import { validatePlaygroundSource } from '../src/lib/execution/playgroundExecutor.js';
import { allMissionsMap } from '../src/services/missionService.js';
import { contentService } from '../src/services/contentService.js';

test('Stage 9 E2E Flow: Complete user progression cycle from learning to gamification', async () => {
  // 1. User discovers courses
  const courses = await contentService.getCourses();
  assert.ok(courses.length >= 8);
  const course = await contentService.getCourseBySlug('linux-fundamentals');
  assert.ok(course);
  assert.equal(course.slug, 'linux-fundamentals');

  // 2. User explores lessons
  const courseLessons = await contentService.getCourseLessons('linux-fundamentals');
  assert.ok(courseLessons.length >= 23);
  const lesson = courseLessons[0];
  assert.ok(lesson.title);
  assert.ok(lesson.objectives.length > 0);

  // 3. User finishes lesson and earns XP
  let userTotalXP = 0;
  userTotalXP += XP_REWARDS.LESSON_COMPLETION; // 15 XP
  userTotalXP += XP_REWARDS.KNOWLEDGE_CHECK;   // 10 XP
  assert.equal(userTotalXP, 25);

  let progress = getLevelProgress(userTotalXP);
  assert.equal(progress.currentLevel, 1);
  assert.equal(progress.rank, 'Novice');

  // 4. User moves to missions
  const mission = allMissionsMap['observe-a-process'];
  assert.ok(mission);
  assert.equal(mission.slug, 'observe-a-process');

  // 5. User submits mission and earns Mission XP
  userTotalXP += XP_REWARDS.MISSION_BEGINNER; // +50 XP -> 75 XP
  progress = getLevelProgress(userTotalXP);
  assert.equal(progress.currentLevel, 2); // 75 XP > 50 XP (Level 2 threshold)
  assert.equal(progress.rank, 'Novice');

  // 6. User explores eBPF playground and tests code validation
  const testBpfCode = `
#include <linux/bpf.h>
#include <bpf/bpf_helpers.h>

SEC("tracepoint/syscalls/sys_enter_execve")
int trace_execve(void *ctx) {
    bpf_printk("execve called\\n");
    return 0;
}
char LICENSE[] SEC("license") = "GPL";
  `;

  const validationResult = validatePlaygroundSource(testBpfCode);
  assert.equal(validationResult.valid, true);

  // 7. User completes more missions & advances to higher rank
  userTotalXP += XP_REWARDS.COURSE_COMPLETION; // +250 XP -> 325 XP
  progress = getLevelProgress(userTotalXP);
  assert.ok(progress.currentLevel >= 3);
  assert.equal(progress.rank, 'Explorer');
});
