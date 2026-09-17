import test from 'node:test';
import assert from 'node:assert';
import {
  playgroundService,
  allPlaygroundExamples,
  allPlaygroundExamplesMap,
} from '../src/services/playgroundService.js';
import {
  defaultPlaygroundExecutor,
  validatePlaygroundSource,
  ExecutionState,
} from '../src/lib/execution/playgroundExecutor.js';

test('Playground Service: all 6 canonical eBPF examples are defined with complete metadata', async () => {
  const examples = await playgroundService.getExamples();
  assert.strictEqual(examples.length, 6);

  const expectedSlugs = [
    'hello-ebpf',
    'trace-process',
    'file-open',
    'count-events',
    'network-events',
    'xdp-intro',
  ];

  for (const slug of expectedSlugs) {
    const ex = allPlaygroundExamplesMap[slug];
    assert.ok(ex, `Example ${slug} must exist in map`);
    assert.ok(ex.title, `Example ${slug} must have a title`);
    assert.ok(ex.shortDescription, `Example ${slug} must have shortDescription`);
    assert.ok(ex.category, `Example ${slug} must have category`);
    assert.ok(ex.difficulty, `Example ${slug} must have difficulty`);
    assert.strictEqual(ex.language, 'c');
    assert.ok(typeof ex.starterSource === 'string' && ex.starterSource.length > 50);
    assert.ok(typeof ex.explanation === 'string' && ex.explanation.length > 50);
    assert.ok(typeof ex.sampleOutput === 'string' && ex.sampleOutput.length > 20);
  }
});

test('Playground Service: getExamplesByCategory groups examples properly', async () => {
  const grouped = await playgroundService.getExamplesByCategory();
  assert.ok(grouped['Getting Started']);
  assert.ok(grouped['Tracing']);
  assert.ok(grouped['Maps']);
  assert.ok(grouped['Networking']);
  assert.strictEqual(grouped['Tracing'].length, 2);
  assert.strictEqual(grouped['Networking'].length, 2);
});

test('Playground Static Validator: validates source code boundaries safely', () => {
  const emptyRes = validatePlaygroundSource('');
  assert.strictEqual(emptyRes.valid, false);

  const whitespaceRes = validatePlaygroundSource('   \n\t  ');
  assert.strictEqual(whitespaceRes.valid, false);

  const giantCode = 'A'.repeat(50 * 1024 + 1);
  const tooLargeRes = validatePlaygroundSource(giantCode);
  assert.strictEqual(tooLargeRes.valid, false);
  assert.match(tooLargeRes.error, /exceeds maximum limit/);

  const validRes = validatePlaygroundSource('SEC("tracepoint") int probe() { return 0; }');
  assert.strictEqual(validRes.valid, true);
});

test('Playground Executor: returns safe mock environment without executing host commands', async () => {
  // Authenticated user creates enqueued job
  const result = await defaultPlaygroundExecutor.execute({
    exampleSlug: 'hello-ebpf',
    source: 'SEC("tracepoint") int test() { return 0; }',
    userId: 'user-1',
  });

  assert.strictEqual(result.status, ExecutionState.QUEUED);
  assert.ok(result.jobId);
  assert.match(result.notice, /enqueued/i);

  // Guest execution runs directly through mock orchestrator
  const guestResult = await defaultPlaygroundExecutor.execute({
    exampleSlug: 'hello-ebpf',
    source: '#include <vmlinux.h>\nSEC("tracepoint") int test() { return 0; }',
    userId: null,
  });
  assert.strictEqual(guestResult.status, ExecutionState.COMPLETED);
  assert.match(guestResult.output, /BPF verifier preflight check/);

  // Negative test: empty code
  const failRes = await defaultPlaygroundExecutor.execute({
    exampleSlug: 'hello-ebpf',
    source: '',
  });
  assert.strictEqual(failRes.status, ExecutionState.FAILED);
});

test('Playground Security: solutions are not exposed in client payload', async () => {
  for (const ex of allPlaygroundExamples) {
    // Assert no hidden solution or answer keys leaked in client-facing object
    assert.strictEqual(ex.solutionSource, undefined);
    assert.strictEqual(ex.flag, undefined);
  }
});
