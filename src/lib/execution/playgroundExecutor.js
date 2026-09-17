import { defaultExecutionService } from '../../services/execution/executionService.js';
import { ExecutionJobStatus, ExecutionErrorCode } from '../../services/execution/executionTypes.js';
import { validateExecutionInput } from '../../services/execution/executionPolicy.js';

export const ExecutionState = {
  IDLE: 'IDLE',
  QUEUED: 'QUEUED',
  STARTING: 'STARTING',
  RUNNING: 'RUNNING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  TIMEOUT: 'TIMEOUT',
  UNAVAILABLE: 'UNAVAILABLE',
};

export function validatePlaygroundSource(source) {
  const result = validateExecutionInput({ source, exampleSlug: 'check' });
  return { valid: result.valid, error: result.error };
}

/**
 * Service class for playground execution lifecycle connected to Stage 7 Queue & Worker.
 */
export class PlaygroundExecutor {
  async execute({ exampleSlug, source, userId = null }) {
    if (!userId) {
      // In guest mode, run synchronously through orchestrator mock runner for instant feedback
      const validation = validatePlaygroundSource(source);
      if (!validation.valid) {
        return {
          status: ExecutionState.FAILED,
          error: validation.error,
          output: '',
          logs: [`Validation error: ${validation.error}`],
        };
      }

      const { defaultLabOrchestrator } = await import('../../services/labs/labOrchestrator.js');
      const res = await defaultLabOrchestrator.runLabExecution({
        jobId: `guest-${Date.now()}`,
        templateId: 'ebpf-base',
        source,
        targetSlug: exampleSlug || 'program',
      });

      return {
        status: res.success ? ExecutionState.COMPLETED : ExecutionState.FAILED,
        output: res.output,
        logs: res.logs,
        provider: res.provider,
        notice: 'Executed via BPFQuest Safe Isolated Sandbox (Mock Provider).',
      };
    }

    // Authenticated user: enqueue job asynchronously via Stage 7 ExecutionService
    const job = await defaultExecutionService.submitJob({
      userId,
      source,
      exampleSlug,
    });

    return {
      status: ExecutionState.QUEUED,
      jobId: job.jobId,
      notice: 'Job enqueued for isolated lab runner.',
    };
  }

  async getStatus(jobId, userId) {
    return defaultExecutionService.getJobStatus(jobId, userId);
  }

  async cancel(jobId, userId) {
    return defaultExecutionService.cancelJob(jobId, userId);
  }
}

export const defaultPlaygroundExecutor = new PlaygroundExecutor();
export default defaultPlaygroundExecutor;