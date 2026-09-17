import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ExecutionPolicy,
  validateExecutionInput,
  sanitizeOutput,
} from '../src/services/execution/executionPolicy.js';
import {
  ExecutionJobStatus,
  ExecutionErrorCode,
} from '../src/services/execution/executionTypes.js';
import { MockLabProvider } from '../src/services/labs/mockLabProvider.js';
import { ContainerLabProvider } from '../src/services/labs/containerLabProvider.js';
import { LabOrchestrator } from '../src/services/labs/labOrchestrator.js';
import { JobQueue } from '../src/services/execution/jobQueue.js';
import { ExecutionWorker } from '../src/services/execution/executionWorker.js';
import { ExecutionService } from '../src/services/execution/executionService.js';

test('Stage 7: ExecutionPolicy enforcement', () => {
  assert.equal(ExecutionPolicy.MAX_SOURCE_BYTES, 50 * 1024);
  assert.equal(ExecutionPolicy.MAX_OUTPUT_BYTES, 64 * 1024);
  assert.equal(ExecutionPolicy.NETWORK_ACCESS, 'none');

  // Reject empty source
  const emptyRes = validateExecutionInput({ source: '   ', exampleSlug: 'test' });
  assert.equal(emptyRes.valid, false);

  // Reject missing context
  const noCtx = validateExecutionInput({ source: 'int main() {}' });
  assert.equal(noCtx.valid, false);

  // Reject oversized source
  const hugeSource = 'A'.repeat(51 * 1024);
  const hugeRes = validateExecutionInput({ source: hugeSource, exampleSlug: 'test' });
  assert.equal(hugeRes.valid, false);
  assert.match(hugeRes.error, /exceeds maximum limit/);

  // Valid input
  const validRes = validateExecutionInput({ source: '#include <vmlinux.h>\nSEC("tracepoint") int t() { return 0; }', exampleSlug: 'trace' });
  assert.equal(validRes.valid, true);
});

test('Stage 7: Output Sanitization strips secrets and enforces byte caps', () => {
  const secretString = 'Connected to postgres://admin:supersecretpassword@db.internal:5432/quest and NEXTAUTH_SECRET=xyz123';
  const sanitized = sanitizeOutput(secretString);
  assert.ok(!sanitized.includes('supersecretpassword'));
  assert.ok(!sanitized.includes('xyz123'));
  assert.ok(sanitized.includes('postgres://***:***@'));

  // Output truncation
  const hugeOutput = 'X'.repeat(70 * 1024);
  const bounded = sanitizeOutput(hugeOutput);
  assert.ok(Buffer.byteLength(bounded, 'utf8') <= 65 * 1024);
  assert.match(bounded, /Output truncated/);
});

test('Stage 7: MockLabProvider behaves safely without host execution', async () => {
  const provider = new MockLabProvider();
  assert.equal(provider.id, 'mock');
  assert.equal(await provider.isAvailable(), true);

  const lab = await provider.createLab({ jobId: 'test-job-1' });
  assert.ok(lab.labId.startsWith('lab-mock-'));

  const result = await provider.execute(lab.labId, {
    source: '#include <vmlinux.h>\nSEC("tracepoint/syscalls/sys_enter_write") int h() { return 0; }',
    targetSlug: 'hello-ebpf',
  });

  assert.equal(result.success, true);
  assert.match(result.output, /BPF verifier preflight check: SUCCESS/);

  await provider.destroyLab(lab.labId);
  const status = await provider.getLabStatus(lab.labId);
  assert.equal(status.status, 'DESTROYED');
});

test('Stage 7: ContainerLabProvider rejects unconfigured host environments safely', async () => {
  const provider = new ContainerLabProvider();
  assert.equal(provider.id, 'container');
  // When ENABLE_CONTAINER_LABS is not set, must be unavailable
  assert.equal(await provider.isAvailable(), false);

  await assert.rejects(
    async () => {
      await provider.createLab({ jobId: 'test-job-2' });
    },
    /LAB_EXECUTION_UNAVAILABLE/
  );
});

test('Stage 7: LabOrchestrator manages lifecycle and guaranteed cleanup', async () => {
  const orchestrator = new LabOrchestrator();
  const res = await orchestrator.runLabExecution({
    jobId: 'orch-test-1',
    source: '#include <vmlinux.h>\nSEC("tracepoint") int t() { return 0; }',
    targetSlug: 'trace',
  });

  assert.equal(res.success, true);
  assert.equal(res.provider, 'mock');
  assert.equal(orchestrator.activeLabs.size, 0); // Cleanup guaranteed
});

test('Stage 7: JobQueue manages concurrency limits and rate limits', () => {
  const queue = new JobQueue();

  // Test per-user concurrency limit
  queue.enqueue({ id: 'job-1', userId: 'user-a' });
  queue.enqueue({ id: 'job-2', userId: 'user-a' });

  // 3rd job for same user should throw RESOURCE_LIMIT
  assert.throws(() => {
    queue.enqueue({ id: 'job-3', userId: 'user-a' });
  }, /RESOURCE_LIMIT/);

  // Releasing job slot allows next enqueue
  queue.completeJob('job-1', 'user-a');
  const enqueued = queue.enqueue({ id: 'job-3', userId: 'user-a' });
  assert.equal(enqueued.id, 'job-3');
});

test('Stage 7: ExecutionService authorization and job access boundary', async () => {
  const queue = new JobQueue();
  const service = new ExecutionService(queue);

  // Submit job as user-123
  const submission = await service.submitJob({
    userId: 'user-123',
    source: '#include <vmlinux.h>\nSEC("tracepoint") int run() { return 0; }',
    exampleSlug: 'hello-ebpf',
  });

  assert.ok(submission.jobId);
  assert.equal(submission.status, 'QUEUED');

  // User-123 can view status
  const status = await service.getJobStatus(submission.jobId, 'user-123');
  assert.ok(status);
  assert.equal(status.id, submission.jobId);

  // User-456 CANNOT view User-123 job status
  await assert.rejects(
    async () => {
      await service.getJobStatus(submission.jobId, 'user-456');
    },
    /Access denied/
  );

  // User-456 CANNOT cancel User-123 job
  await assert.rejects(
    async () => {
      await service.cancelJob(submission.jobId, 'user-456');
    },
    /Access denied/
  );

  // User-123 CAN cancel their own job
  const cancelled = await service.cancelJob(submission.jobId, 'user-123');
  assert.equal(cancelled, true);
});