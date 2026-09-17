/**
 * Stage 7: Lab Provider Base Interface & Types
 *
 * Defines the pluggable provider contract for spinning up disposable
 * Linux/eBPF environments (e.g. MockLabProvider, ContainerLabProvider, FirecrackerLabProvider).
 */

export class LabProvider {
  /**
   * Provider identifier (e.g. 'mock', 'container', 'firecracker')
   */
  get id() {
    throw new Error('LabProvider.id must be implemented by subclass');
  }

  /**
   * Friendly display name
   */
  get name() {
    throw new Error('LabProvider.name must be implemented by subclass');
  }

  /**
   * Indicates whether this provider is available and healthy in current host environment.
   */
  async isAvailable() {
    return false;
  }

  /**
   * Spawns an isolated ephemeral lab session.
   * @param {Object} options
   * @param {string} options.templateId
   * @param {string} options.jobId
   * @param {number} options.timeoutMs
   * @returns {Promise<{ labId: string, status: string, expiresAt: Date }>}
   */
  async createLab(options) {
    throw new Error('createLab() must be implemented by subclass');
  }

  /**
   * Returns current lifecycle status of the lab.
   * @param {string} labId
   * @returns {Promise<{ status: string, details?: any }>}
   */
  async getLabStatus(labId) {
    throw new Error('getLabStatus() must be implemented by subclass');
  }

  /**
   * Executes source compilation and program load inside the isolated environment.
   * @param {string} labId
   * @param {Object} payload
   * @param {string} payload.source
   * @param {string} payload.targetSlug
   * @param {AbortSignal} [signal]
   * @returns {Promise<{ success: boolean, output: string, exitCode: number, logs: string[] }>}
   */
  async execute(labId, payload, signal) {
    throw new Error('execute() must be implemented by subclass');
  }

  /**
   * Collects logs and final output from the lab.
   * @param {string} labId
   * @returns {Promise<{ output: string, logs: string[] }>}
   */
  async collectOutput(labId) {
    throw new Error('collectOutput() must be implemented by subclass');
  }

  /**
   * Signals the lab process to terminate.
   * @param {string} labId
   * @returns {Promise<void>}
   */
  async terminateLab(labId) {
    throw new Error('terminateLab() must be implemented by subclass');
  }

  /**
   * Permanently destroys and deallocates the ephemeral container/VM.
   * @param {string} labId
   * @returns {Promise<void>}
   */
  async destroyLab(labId) {
    throw new Error('destroyLab() must be implemented by subclass');
  }
}