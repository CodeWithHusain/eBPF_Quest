import crypto from 'crypto';
import { prisma } from '../../lib/db/prisma.js';
import { defaultJobQueue } from './jobQueue.js';
import { defaultExecutionWorker } from './executionWorker.js';
import { ExecutionJobStatus, ExecutionErrorCode } from './executionTypes.js';
import { validateExecutionInput } from './executionPolicy.js';

// Connect DB persistence layer to Worker
defaultExecutionWorker.setDbUpdater(async (jobId, updates) => {
  try {
    await prisma.executionJob.update({
      where: { id: jobId },
      data: updates,
    });
  } catch (err) {
    // If DB is offline (e.g. during standalone test runner), fallback silently
  }
});

/**
 * Stage 7: Execution Service
 *
 * High-level orchestration boundary called by Next.js API route handlers.
 * Handles validation, DB job record creation, queue dispatch, and cancellation.
 */
export class ExecutionService {
  constructor(queue = defaultJobQueue, worker = defaultExecutionWorker) {
    this.queue = queue;
    this.worker = worker;
    this.inMemoryJobs = new Map(); // Fallback when DB unavailable
  }

  /**
   * Submits and enqueues a new execution job.
   */
  async submitJob({ userId, source, exampleSlug, missionSlug }) {
    if (!userId) {
      throw new Error(ExecutionErrorCode.UNAUTHORIZED);
    }

    // 1. Validate Input
    const validation = validateExecutionInput({ source, exampleSlug, missionSlug });
    if (!validation.valid) {
      const err = new Error(validation.error);
      err.code = ExecutionErrorCode.INVALID_REQUEST;
      throw err;
    }

    // 2. Hash source code (never store raw unlimited payload without bound)
    const sourceHash = crypto.createHash('sha256').update(source).digest('hex');

    // 3. Create persistent ExecutionJob record
    let jobRecord = null;
    try {
      jobRecord = await prisma.executionJob.create({
        data: {
          userId,
          exampleSlug: exampleSlug || null,
          missionSlug: missionSlug || null,
          sourceHash,
          status: ExecutionJobStatus.QUEUED,
          logs: JSON.stringify(['[Execution Service] Job created and enqueued.']),
        },
      });
    } catch (dbErr) {
      // Fallback in-memory job for dev/test without DB
      const mockId = `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      jobRecord = {
        id: mockId,
        userId,
        exampleSlug,
        missionSlug,
        sourceHash,
        status: ExecutionJobStatus.QUEUED,
        createdAt: new Date(),
        logs: JSON.stringify(['[Execution Service] Job created (in-memory mode).']),
      };
      this.inMemoryJobs.set(mockId, jobRecord);
    }

    // 4. Dispatch to queue
    const jobPayload = {
      id: jobRecord.id,
      userId,
      source,
      exampleSlug,
      missionSlug,
    };

    try {
      this.queue.enqueue(jobPayload);
    } catch (queueErr) {
      // Update job to failed if queue rejected (rate limit, queue full)
      const errCode = queueErr.message || ExecutionErrorCode.QUEUE_UNAVAILABLE;
      try {
        await prisma.executionJob.update({
          where: { id: jobRecord.id },
          data: {
            status: ExecutionJobStatus.FAILED,
            errorCode: errCode,
          },
        });
      } catch (e) {}

      if (this.inMemoryJobs.has(jobRecord.id)) {
        const mem = this.inMemoryJobs.get(jobRecord.id);
        mem.status = ExecutionJobStatus.FAILED;
        mem.errorCode = errCode;
      }

      const err = new Error(`Execution request rejected: ${errCode}`);
      err.code = errCode;
      throw err;
    }

    return {
      jobId: jobRecord.id,
      status: ExecutionJobStatus.QUEUED,
    };
  }

  /**
   * Retrieves sanitized job status.
   */
  async getJobStatus(jobId, requestingUserId) {
    if (!jobId) return null;

    let job = null;
    try {
      job = await prisma.executionJob.findUnique({
        where: { id: jobId },
      });
    } catch (err) {
      job = null;
    }

    if (!job) {
      job = this.inMemoryJobs.get(jobId);
    }

    if (!job) {
      return null;
    }

    // Authorize: Only the owner (or admin) can view job output
    if (job.userId !== requestingUserId) {
      const err = new Error('Access denied to requested execution job.');
      err.code = ExecutionErrorCode.FORBIDDEN;
      throw err;
    }

    return {
      id: job.id,
      status: job.status,
      exampleSlug: job.exampleSlug,
      missionSlug: job.missionSlug,
      output: job.output || '',
      errorCode: job.errorCode || null,
      logs: job.logs ? JSON.parse(job.logs) : [],
      validationResult: job.validationResult ? JSON.parse(job.validationResult) : null,
      createdAt: job.createdAt,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
    };
  }

  /**
   * Cancels a running execution job.
   */
  async cancelJob(jobId, requestingUserId) {
    let job = null;
    try {
      job = await prisma.executionJob.findUnique({ where: { id: jobId } });
    } catch (err) {
      job = null;
    }

    if (!job) {
      job = this.inMemoryJobs.get(jobId);
    }

    if (!job) return false;

    if (job.userId !== requestingUserId) {
      const err = new Error('Access denied to cancel execution job.');
      err.code = ExecutionErrorCode.FORBIDDEN;
      throw err;
    }

    if (
      job.status === ExecutionJobStatus.COMPLETED ||
      job.status === ExecutionJobStatus.CANCELLED ||
      job.status === ExecutionJobStatus.FAILED
    ) {
      return false; // Already finished
    }

    // Terminate in worker/orchestrator
    this.worker.cancelJob(jobId);

    try {
      await prisma.executionJob.update({
        where: { id: jobId },
        data: {
          status: ExecutionJobStatus.CANCELLED,
          errorCode: ExecutionErrorCode.USER_CANCELLED,
          completedAt: new Date(),
        },
      });
    } catch (err) {
      if (this.inMemoryJobs.has(jobId)) {
        const mem = this.inMemoryJobs.get(jobId);
        mem.status = ExecutionJobStatus.CANCELLED;
        mem.errorCode = ExecutionErrorCode.USER_CANCELLED;
      }
    }

    return true;
  }
}

export const defaultExecutionService = new ExecutionService();