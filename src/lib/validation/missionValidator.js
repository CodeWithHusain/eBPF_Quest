/**
 * Mission Validator Interface & Safe Mock Implementation
 * 
 * SECURITY NOTICE:
 * Stage 5 does NOT execute arbitrary shell commands, user scripts, C code, or eBPF programs.
 * This mock validator evaluates structured solution inputs deterministically without any
 * child process spawning, eval(), or dynamic host execution.
 */

export const ValidationStatus = {
  PASS: 'PASS',
  FAIL: 'FAIL',
  ERROR: 'ERROR',
  TIMEOUT: 'TIMEOUT',
};

/**
 * Validates a user's mission submission.
 *
 * @param {Object} params
 * @param {string} params.missionSlug - The unique mission slug
 * @param {Object} params.payload - The solution input data provided by user
 * @param {string} [params.userId] - The authenticated user ID
 * @returns {Promise<{
 *   status: 'PASS' | 'FAIL' | 'ERROR' | 'TIMEOUT',
 *   score: number,
 *   feedback: string,
 *   passedObjectives: string[],
 *   details?: any
 * }>}
 */
export async function validateSubmission({ missionSlug, payload = {}, userId = null }) {
  if (!missionSlug || typeof missionSlug !== 'string') {
    return {
      status: ValidationStatus.ERROR,
      score: 0,
      feedback: 'Invalid mission identifier provided.',
      passedObjectives: [],
    };
  }

  // Safe deterministic validation logic per mission
  switch (missionSlug) {
    case 'observe-a-process': {
      // Accepts solution acknowledging process name or PID or /proc status inspection
      const input = (payload.solutionText || payload.processName || '').toLowerCase().trim();
      const confirmedCheck = Boolean(payload.inspectionConfirmed);

      if (
        input.includes('telemetry') ||
        input.includes('4210') ||
        input.includes('ps') ||
        input.includes('/proc') ||
        confirmedCheck
      ) {
        return {
          status: ValidationStatus.PASS,
          score: 100,
          feedback:
            'Excellent work! You successfully identified the target telemetry process, verified its PID/PPID hierarchy, and inspected /proc/[pid]/status.',
          passedObjectives: [
            'TARGET_PID_IDENTIFIED',
            'PARENT_PPID_VERIFIED',
            'PROC_STATUS_INSPECTED',
          ],
        };
      }

      return {
        status: ValidationStatus.FAIL,
        score: 0,
        feedback:
          'Not quite. Make sure to identify the target process name or PID and inspect its parent process in /proc.',
        passedObjectives: [],
      };
    }

    case 'explore-file-descriptors': {
      const input = (payload.solutionText || payload.leakingFile || '').toLowerCase().trim();
      const confirmedCheck = Boolean(payload.inspectionConfirmed);

      if (
        input.includes('audit_events') ||
        input.includes('/var/log') ||
        input.includes('log_shipper') ||
        confirmedCheck
      ) {
        return {
          status: ValidationStatus.PASS,
          score: 100,
          feedback:
            'Great investigation! You pinpointed the accumulated file descriptor references in /proc/<pid>/fd pointing to the unclosed audit log file.',
          passedObjectives: [
            'STDIO_STREAMS_VERIFIED',
            'FD_LEAK_IDENTIFIED',
            'SOCKET_INODES_MAPPED',
          ],
        };
      }

      return {
        status: ValidationStatus.FAIL,
        score: 0,
        feedback:
          'Your investigation did not identify the leaking file descriptor target. Review /proc/[pid]/fd symbolic links and try again.',
        passedObjectives: [],
      };
    }

    case 'find-a-network-interface': {
      const input = (payload.solutionText || payload.targetInterface || '').toLowerCase().trim();
      const confirmedCheck = Boolean(payload.inspectionConfirmed);

      if (
        input.includes('eth1') ||
        input.includes('down') ||
        input.includes('1420') ||
        input.includes('mtu') ||
        confirmedCheck
      ) {
        return {
          status: ValidationStatus.PASS,
          score: 100,
          feedback:
            'Mission accomplished! You identified the dormant link operational state on the secondary interface and detected the MTU constraint.',
          passedObjectives: [
            'INTERFACE_STATES_LISTED',
            'IP_ADDRESS_VERIFIED',
            'MTU_CHECKED',
          ],
        };
      }

      return {
        status: ValidationStatus.FAIL,
        score: 0,
        feedback:
          'Interface status check failed. Check the interface state (UP/DOWN) and MTU configuration using ip link.',
        passedObjectives: [],
      };
    }

    case 'trace-a-process-event': {
      const input = (payload.solutionText || payload.targetTracepoint || '').toLowerCase().trim();
      const confirmedCheck = Boolean(payload.inspectionConfirmed);

      if (
        input.includes('sched_process_exec') ||
        input.includes('execve') ||
        input.includes('tracepoint') ||
        confirmedCheck
      ) {
        return {
          status: ValidationStatus.PASS,
          score: 150,
          feedback:
            'Outstanding! You specified the kernel tracepoint sched:sched_process_exec and structured the appropriate event inspection schema.',
          passedObjectives: [
            'TRACEPOINT_NAME_IDENTIFIED',
            'EVENT_FORMAT_INSPECTED',
            'PROBE_EXPRESSION_VERIFIED',
          ],
        };
      }

      return {
        status: ValidationStatus.FAIL,
        score: 0,
        feedback:
          'Tracepoint signature mismatch. Review the sched:sched_process_exec tracepoint path in /sys/kernel/debug/tracing.',
        passedObjectives: [],
      };
    }

    case 'first-ebpf-program': {
      const input = (payload.solutionText || payload.sectionHeader || '').toLowerCase().trim();
      const confirmedCheck = Boolean(payload.inspectionConfirmed);

      if (
        input.includes('sec(') ||
        input.includes('tracepoint') ||
        input.includes('bpf_map') ||
        confirmedCheck
      ) {
        return {
          status: ValidationStatus.PASS,
          score: 200,
          feedback:
            'Verifier checks passed! Your eBPF program skeleton includes the requisite ELF section macro, safe map declarations, and bounded return semantics.',
          passedObjectives: [
            'SEC_DIRECTIVE_DEFINED',
            'BPF_MAP_DECLARED',
            'VERIFIER_SAFETY_CONFIRMED',
          ],
        };
      }

      return {
        status: ValidationStatus.FAIL,
        score: 0,
        feedback:
          'eBPF verifier preflight check failed. Ensure you define SEC("tracepoint/...") and declare a valid BPF map structure.',
        passedObjectives: [],
      };
    }

    default:
      return {
        status: ValidationStatus.ERROR,
        score: 0,
        feedback: `Mission '${missionSlug}' does not have an active validator profile.`,
        passedObjectives: [],
      };
  }
}
