import test from 'node:test';
import assert from 'node:assert';
import { missionService, allMissions, allMissionsMap } from '../src/services/missionService.js';
import { validateSubmission, ValidationStatus } from '../src/lib/validation/missionValidator.js';
import {
  startMissionAttempt,
  submitMissionAttempt,
  getUserMissionStats,
  getMissionWithUserStatus,
} from '../src/lib/db/missions.js';

test('Mission Service: all 5 initial missions are defined with complete technical metadata', async () => {
  const missions = await missionService.getMissions();
  assert.strictEqual(missions.length, 5);

  const expectedSlugs = [
    'observe-a-process',
    'explore-file-descriptors',
    'find-a-network-interface',
    'trace-a-process-event',
    'first-ebpf-program',
  ];

  for (const slug of expectedSlugs) {
    const mission = allMissionsMap[slug];
    assert.ok(mission, `Mission ${slug} should exist in map`);
    assert.ok(mission.title, `Mission ${slug} must have a title`);
    assert.ok(mission.description, `Mission ${slug} must have description`);
    assert.ok(mission.story, `Mission ${slug} must have a scenario narrative`);
    assert.ok(mission.instructions, `Mission ${slug} must have instructions`);
    assert.ok(Array.isArray(mission.objectives) && mission.objectives.length > 0);
    assert.ok(Array.isArray(mission.hints) && mission.hints.length > 0);
    assert.ok(Array.isArray(mission.prerequisites) && mission.prerequisites.length > 0);
    assert.strictEqual(typeof mission.estimatedMinutes, 'number');
    assert.strictEqual(typeof mission.points, 'number');
    assert.strictEqual(mission.isPublished, true);
  }
});

test('Mission Service: Category and Difficulty filtering work as expected', async () => {
  const linuxMissions = await missionService.getMissionsByCategory('LINUX');
  assert.ok(linuxMissions.length >= 2);
  assert.ok(linuxMissions.every((m) => m.category === 'LINUX'));

  const tracingMissions = await missionService.getMissionsByCategory('TRACING');
  assert.strictEqual(tracingMissions.length, 1);
  assert.strictEqual(tracingMissions[0].slug, 'trace-a-process-event');

  const beginnerMissions = await missionService.getMissionsByDifficulty('BEGINNER');
  assert.ok(beginnerMissions.length >= 3);
  assert.ok(beginnerMissions.every((m) => m.difficulty === 'BEGINNER'));

  const intermediateMissions = await missionService.getMissionsByDifficulty('INTERMEDIATE');
  assert.strictEqual(intermediateMissions.length, 2);
});

test('Mission Validator: safe deterministic mock validation without arbitrary code execution', async () => {
  // Test 1: observe-a-process passing solution
  const passRes = await validateSubmission({
    missionSlug: 'observe-a-process',
    payload: { solutionText: 'telemetry_collector PID 4210 /proc status' },
  });
  assert.strictEqual(passRes.status, ValidationStatus.PASS);
  assert.strictEqual(passRes.score, 100);
  assert.ok(passRes.passedObjectives.includes('TARGET_PID_IDENTIFIED'));

  // Test 2: observe-a-process failing solution
  const failRes = await validateSubmission({
    missionSlug: 'observe-a-process',
    payload: { solutionText: 'random nonsense string' },
  });
  assert.strictEqual(failRes.status, ValidationStatus.FAIL);
  assert.strictEqual(failRes.score, 0);

  // Test 3: explore-file-descriptors passing check
  const fdPass = await validateSubmission({
    missionSlug: 'explore-file-descriptors',
    payload: { solutionText: '/var/log/app/audit_events.log leak' },
  });
  assert.strictEqual(fdPass.status, ValidationStatus.PASS);

  // Test 4: non-existent mission error
  const errRes = await validateSubmission({
    missionSlug: 'invalid-ghost-mission',
    payload: {},
  });
  assert.strictEqual(errRes.status, ValidationStatus.ERROR);
});

test('Mission DB Service: handles unauthenticated guests safely', async () => {
  const guestStats = await getUserMissionStats(null);
  assert.strictEqual(guestStats.completedCount, 0);
  assert.strictEqual(guestStats.inProgressCount, 0);
  assert.deepStrictEqual(guestStats.recentMissions, []);

  const guestMission = await getMissionWithUserStatus('observe-a-process', null);
  assert.ok(guestMission);
  assert.strictEqual(guestMission.userStatus.status, 'NOT_STARTED');
});

test('Mission DB Service: rejects invalid parameters on start and submit', async () => {
  const noUserStart = await startMissionAttempt(null, 'observe-a-process');
  assert.strictEqual(noUserStart.success, false);

  const invalidMissionStart = await startMissionAttempt('user-123', 'fake-mission-xyz');
  assert.strictEqual(invalidMissionStart.success, false);

  const noUserSubmit = await submitMissionAttempt(null, 'observe-a-process', {});
  assert.strictEqual(noUserSubmit.success, false);

  const invalidMissionSubmit = await submitMissionAttempt('user-123', 'fake-mission-xyz', {});
  assert.strictEqual(invalidMissionSubmit.success, false);
});
