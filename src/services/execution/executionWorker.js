import { defaultJobQueue } from './jobQueue.js';
import { defaultLabOrchestrator } from '../labs/labOrchestrator.js';
import { ExecutionJobStatus, ExecutionErrorCode } from './executionTypes.js';
import { sanitizeOutput } from './executionPolicy.js';
import { validateSubmission } from '../../lib/validation/missionValidator.js';

/**
 * Stage 7: Execution Worker Process
 *
 * Subscribes to the job queue, coordinates with the lab orchestrator,
 * runs static/runtime objective validation, and updates database records.
 */
export class ExecutionWorker {
  constructor(queue = defaultJobQueue, orchestrator = defaultLabOrchestrator) {
    this.queue = queue;
    this.orchestrator = orchestrator;
    this.runningJobs = new Map(); // jobId -> abortFn
    this.dbUpdater = null; // Injected persistence hook

    this.init();
  }

  setDbUpdater(fn) {
    this.dbUpdater = fn;
  }

  init() {
    this.queue.on('process', (job) => {
      this.handleJob(job).catch((err) => {
        console.error(`[Worker] Unhandled failure on job ${job?.id}:`, err);
      });
    });
  }

  async updateJobRecord(jobId, updates) {
    if (this.dbUpdater) {
      try {
        await this.dbUpdater(jobId, updates);
      } catch (err) {
        console.error(`[Worker] Failed to persist job ${jobId} update:`, err.message);
      }
    }
  }

  async handleJob(job) {
    const startedAt = new Date();
    await this.updateJobRecord(job.id, {
      status: ExecutionJobStatus.RUNNING,
      startedAt,
    });

    try {
      // 1. Run Lab Execution via LabOrchestrator
      const targetSlug = job.missionSlug || job.exampleSlug || 'program';
      const execResult = await this.orchestrator.runLabExecution({
        jobId: job.id,
        templateId: job.templateId || 'ebpf-base',
        source: job.source,
        targetSlug,
      });

      const sanitizedOut = sanitizeOutput(execResult.output);

      // 2. If part of a Mission, evaluate against Stage 5 MissionValidator
      let validationResult = null;
      let finalStatus = execResult.success ? ExecutionJobStatus.COMPLETED : ExecutionJobStatus.FAILED;

      if (job.missionSlug) {
        await this.updateJobRecord(job.id, { status: ExecutionJobStatus.VALIDATING });
        const valRes = await validateSubmission({
          missionSlug: job.missionSlug,
          payload: {
            solutionText: sanitizedOut,
            inspectionConfirmed: true,
            source: job.source,
          },
          userId: job.userId,
        });

        validationResult = valRes;
        finalStatus = valRes.status === 'PASS' ? ExecutionJobStatus.COMPLETED : ExecutionJobStatus.FAILED;
      }

      // Check if timed out
      if (execResult.errorCode === ExecutionErrorCode.EXECUTION_TIMEOUT) {
        finalStatus = ExecutionJobStatus.TIMEOUT;
      }

      // 3. Mark complete in DB
      await this.updateJobRecord(job.id, {
        status: finalStatus,
        output: sanitizedOut,
        errorCode: execResult.errorCode || null,
        logs: JSON.stringify(execResult.logs || []),
        validationResult: validationResult ? JSON.stringify(validationResult) : null,
        completedAt: new Date(),
      });
    } catch (err) {
      await this.updateJobRecord(job.id, {
        status: ExecutionJobStatus.FAILED,
        errorCode: ExecutionErrorCode.INFRASTRUCTURE_ERROR,
        output: `Worker execution error: ${err.message}`,
        completedAt: new Date(),
      });
    } finally {
      this.queue.completeJob(job.id, job.userId);
    }
  }

  cancelJob(jobId) {
    // If active in orchestrator, cancel lab
    this.orchestrator.cancelLab(jobId);
  }
}

export const defaultExecutionWorker = new ExecutionWorker();