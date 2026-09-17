import { LabProvider } from './labProvider.js';
import { LabState } from '../execution/executionTypes.js';

/**
 * Stage 7: Safe Mock Lab Provider (Development & Safe Sandbox Fallback)
 *
 * Implements deterministic simulation of the compilation and eBPF verification lifecycle.
 * CRITICAL SECURITY PRINCIPLE:
 * Performs ZERO host code execution, ZERO host clang calls, and ZERO kernel loads.
 * All outputs are clearly stamped with [BPFQuest Mock Lab Sandbox].
 */
export class MockLabProvider extends LabProvider {
  constructor() {
    super();
    this.activeLabs = new Map();
  }

  get id() {
    return 'mock';
  }

  get name() {
    return 'BPFQuest Safe Mock Lab Runner (Isolated Dev Mode)';
  }

  async isAvailable() {
    return true;
  }

  async createLab({ templateId = 'ebpf-base', jobId, timeoutMs = 15000 }) {
    const labId = `lab-mock-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const expiresAt = new Date(Date.now() + timeoutMs);

    const labRecord = {
      id: labId,
      jobId,
      templateId,
      status: LabState.READY,
      createdAt: new Date(),
      expiresAt,
      output: '',
      logs: [
        `[Lab ${labId}] Initialized mock sandbox using template '${templateId}'`,
        `[Lab ${labId}] Sandbox status: READY. Host kernel execution disabled for security.`,
      ],
    };

    this.activeLabs.set(labId, labRecord);
    return { labId, status: LabState.READY, expiresAt };
  }

  async getLabStatus(labId) {
    const lab = this.activeLabs.get(labId);
    if (!lab) {
      return { status: LabState.DESTROYED };
    }
    return { status: lab.status };
  }

  async execute(labId, { source = '', targetSlug = 'program' }, signal) {
    const lab = this.activeLabs.get(labId);
    if (!lab) {
      throw new Error(`Mock Lab '${labId}' not found.`);
    }

    lab.status = LabState.RUNNING;
    lab.logs.push(`[Lab ${labId}] Received source payload (${Buffer.byteLength(source, 'utf8')} bytes)`);
    lab.logs.push(`[Lab ${labId}] Invoking simulated Clang BPF compilation pipeline...`);

    // Check for user cancellation or timeout
    if (signal?.aborted) {
      lab.status = LabState.TERMINATED;
      throw new Error('Execution was aborted.');
    }

    // Small async delay to emulate realistic queue and sandbox dispatch
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (signal?.aborted) {
      lab.status = LabState.TERMINATED;
      throw new Error('Execution was aborted.');
    }

    // Deterministic syntax & eBPF inspection
    const hasSecMacro = source.includes('SEC(');
    const hasLicense = source.includes('LICENSE') || source.includes('GPL');
    const hasInclude = source.includes('#include');

    let simulatedOutput = '';
    let success = true;

    if (!hasInclude && !hasSecMacro) {
      success = false;
      simulatedOutput = `[BPFQuest Mock Lab Sandbox - Clang Compiler]
$ clang -O2 -target bpf -D__TARGET_ARCH_x86 -I/usr/include -c ${targetSlug}.bpf.c -o ${targetSlug}.bpf.o
${targetSlug}.bpf.c:1:1: error: expected eBPF section definition or kernel header include
  |
1 | ${source.slice(0, 40)}...
  | ^ missing SEC("...") macro or #include <vmlinux.h>
1 error generated.
compilation terminated with exit code 1.`;
      lab.logs.push(`[Lab ${labId}] Clang compile failed: missing SEC macro or headers`);
    } else {
      simulatedOutput = `[BPFQuest Mock Lab Sandbox]
$ clang -O2 -target bpf -D__TARGET_ARCH_x86 -c ${targetSlug}.bpf.c -o ${targetSlug}.bpf.o
$ llvm-objdump -h ${targetSlug}.bpf.o

Sections:
Idx Name             Size     VMA      Type
  0                  00000000 00000000
  1 .text            00000028 00000000 TEXT
  2 tracepoint/exec  00000040 00000000 TEXT
  3 license          00000004 00000000 DATA

$ bpftool prog load ${targetSlug}.bpf.o /sys/fs/bpf/${targetSlug} type tracepoint
BPF verifier preflight check: SUCCESS (0 insns, 0 errs)
Program successfully attached in mock sandbox environment.

[Output Stream]
Ready to capture telemetry events. Real kernel execution requires dedicated microVM configuration.`;
      lab.logs.push(`[Lab ${labId}] Compilation simulated successfully. ELF generated.`);
      lab.logs.push(`[Lab ${labId}] BPF verifier preflight simulation: SUCCESS`);
    }

    lab.output = simulatedOutput;
    lab.status = success ? LabState.READY : LabState.FAILED;

    return {
      success,
      output: simulatedOutput,
      exitCode: success ? 0 : 1,
      logs: [...lab.logs],
    };
  }

  async collectOutput(labId) {
    const lab = this.activeLabs.get(labId);
    if (!lab) return { output: '', logs: [] };
    return {
      output: lab.output || '',
      logs: [...lab.logs],
    };
  }

  async terminateLab(labId) {
    const lab = this.activeLabs.get(labId);
    if (lab) {
      lab.status = LabState.TERMINATED;
      lab.logs.push(`[Lab ${labId}] Terminated.`);
    }
  }

  async destroyLab(labId) {
    const lab = this.activeLabs.get(labId);
    if (lab) {
      lab.status = LabState.DESTROYED;
      this.activeLabs.delete(labId);
    }
  }
}

export const defaultMockLabProvider = new MockLabProvider();