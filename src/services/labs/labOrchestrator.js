import { defaultMockLabProvider } from './mockLabProvider.js';
import { defaultContainerLabProvider } from './containerLabProvider.js';
import { LabState, ExecutionErrorCode } from '../execution/executionTypes.js';
import { ExecutionPolicy } from '../execution/executionPolicy.js';

/**
 * Stage 7: Lab Orchestrator
 *
 * Coordinates provider resolution, lab instantiation, timeout monitoring,
 * safe execution boundaries, and guaranteed cleanup.
 */
export class LabOrchestrator {
  constructor() {
    this.providers = new Map();
    this.registerProvider(defaultMockLabProvider);
    this.registerProvider(defaultContainerLabProvider);
    this.activeLabs = new Map(); // labId -> { provider, expiresAt, abortController }
  }

  registerProvider(provider) {
    this.providers.set(provider.id, provider);
  }

  /**
   * Resolves the safest available lab provider according to environment configuration.
   */
  async resolveProvider() {
    // If container runner explicitly enabled and available, prefer container provider
    const containerProvider = this.providers.get('container');
    if (containerProvider && (await containerProvider.isAvailable())) {
      return containerProvider;
    }

    // Otherwise use safe mock provider
    const mockProvider = this.providers.get('mock');
    if (mockProvider && (await mockProvider.isAvailable())) {
      return mockProvider;
    }

    throw new Error(ExecutionErrorCode.LAB_UNAVAILABLE);
  }

  /**
   * Runs an execution lifecycle end-to-end with guaranteed cleanup:
   * 1. createLab()
   * 2. execute() with hard timeout watchdog
   * 3. collectOutput()
   * 4. destroyLab() in finally block
   */
  async runLabExecution({ jobId, templateId = 'ebpf-base', source, targetSlug, timeoutMs = ExecutionPolicy.DEFAULT_TIMEOUT_MS }) {
    const provider = await this.resolveProvider();
    const cappedTimeout = Math.min(timeoutMs, ExecutionPolicy.MAX_TIMEOUT_MS);

    let labId = null;
    let labCreated = false;
    const abortController = new AbortController();

    // Setup hard timeout timer
    const timeoutHandle = setTimeout(() => {
      abortController.abort(new Error(ExecutionErrorCode.EXECUTION_TIMEOUT));
    }, cappedTimeout);

    try {
      // 1. Create Lab
      const labInfo = await provider.createLab({
        templateId,
        jobId,
        timeoutMs: cappedTimeout,
      });

      labId = labInfo.labId;
      labCreated = true;
      this.activeLabs.set(labId, {
        provider,
        expiresAt: labInfo.expiresAt,
        abortController,
      });

      // 2. Execute code in isolated environment
      const execResult = await provider.execute(
        labId,
        { source, targetSlug },
        abortController.signal
      );

      // 3. Collect Output
      const outputData = await provider.collectOutput(labId);

      return {
        success: execResult.success,
        output: outputData.output || execResult.output || '',
        logs: outputData.logs || execResult.logs || [],
        exitCode: execResult.exitCode ?? 0,
        provider: provider.id,
      };
    } catch (err) {
      if (abortController.signal.aborted) {
        return {
          success: false,
          errorCode: ExecutionErrorCode.EXECUTION_TIMEOUT,
          output: `Execution timed out after ${cappedTimeout / 1000}s. Isolated lab terminated.`,
          logs: [`[Orchestrator] Hard timeout triggered (${cappedTimeout}ms). Lab destroyed.`],
          provider: provider.id,
        };
      }

      return {
        success: false,
        errorCode: err.message || ExecutionErrorCode.EXECUTION_FAILED,
        output: `Execution failed: ${err.message}`,
        logs: [`[Orchestrator Error] ${err.message}`],
        provider: provider.id,
      };
    } finally {
      clearTimeout(timeoutHandle);

      // 4. GUARANTEED CLEANUP: Destroy lab even if execution crashed or timed out
      if (labCreated && labId) {
        try {
          await provider.destroyLab(labId);
        } catch (cleanupErr) {
          console.error(`[LabOrchestrator] Cleanup error for lab ${labId}:`, cleanupErr.message);
        } finally {
          this.activeLabs.delete(labId);
        }
      }
    }
  }

  /**
   * Cancels a running lab session and tears down its sandbox.
   */
  async cancelLab(labId) {
    const entry = this.activeLabs.get(labId);
    if (!entry) return;

    entry.abortController.abort(new Error(ExecutionErrorCode.USER_CANCELLED));
    try {
      await entry.provider.terminateLab(labId);
      await entry.provider.destroyLab(labId);
    } catch (err) {
      console.error(`[LabOrchestrator] Error cancelling lab ${labId}:`, err.message);
    } finally {
      this.activeLabs.delete(labId);
    }
  }

  /**
   * Periodic reaper: Scans and destroys any lingering expired labs.
   */
  async reapExpiredLabs() {
    const now = new Date();
    for (const [labId, entry] of this.activeLabs.entries()) {
      if (entry.expiresAt && entry.expiresAt <= now) {
        try {
          await entry.provider.destroyLab(labId);
        } catch (err) {
          console.error(`[LabOrchestrator Reaper] Failed reaping lab ${labId}:`, err.message);
        } finally {
          this.activeLabs.delete(labId);
        }
      }
    }
  }
}

export const defaultLabOrchestrator = new LabOrchestrator();