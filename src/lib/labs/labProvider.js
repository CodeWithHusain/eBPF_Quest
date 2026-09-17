/**
 * Future Lab Provider Interface & Safe Mock Implementation
 *
 * STAGE 5 BOUNDARY:
 * This abstraction prepares BPFQuest for hardware-isolated microVMs or container
 * orchestration in Stage 7. No real Docker daemons, Firecracker VMs, or kernel
 * processes are provisioned in this stage.
 */

export const LabEnvironmentStatus = {
  PENDING: 'PENDING',
  READY: 'READY',
  BUSY: 'BUSY',
  TERMINATED: 'TERMINATED',
  UNAVAILABLE: 'UNAVAILABLE',
};

export class LabProvider {
  /**
   * Simulates provisioning an isolated lab instance for a mission.
   */
  async create({ missionSlug, userId }) {
    return {
      id: `lab-mock-${Date.now()}`,
      missionSlug,
      userId,
      status: LabEnvironmentStatus.READY,
      environment: 'Simulated Linux Kernel 6.8 (Mock Environment)',
      containerId: 'sim-sandbox-01',
      resourceLimits: {
        vCpu: 1,
        memoryMb: 512,
        networkEgress: 'DISABLED',
      },
      createdAt: new Date().toISOString(),
      notice:
        'Notice: This is a safe interactive simulation. Production microVM lab runner integration unlocks in Stage 7.',
    };
  }

  /**
   * Retrieves the status of a lab environment.
   */
  async getStatus(labId) {
    return {
      id: labId,
      status: LabEnvironmentStatus.READY,
      uptimeSeconds: 120,
    };
  }

  /**
   * Stops a lab environment.
   */
  async stop(labId) {
    return { id: labId, status: LabEnvironmentStatus.TERMINATED };
  }

  /**
   * Destroys a lab environment.
   */
  async destroy(labId) {
    return { id: labId, status: LabEnvironmentStatus.TERMINATED };
  }
}

export const defaultLabProvider = new LabProvider();
export default defaultLabProvider;
