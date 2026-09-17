/**
 * Playground Example: Trace Process Execution
 * Category: Tracing | Language: c
 */

export const traceProcessExample = {
  id: 'example-trace-process',
  slug: 'trace-process',
  title: 'Trace Process Execution',
  shortDescription: 'Capture new process creations and examine executable command names in real time.',
  category: 'Tracing',
  difficulty: 'BEGINNER',
  language: 'c',
  order: 2,
  prerequisites: ['Linux Fundamentals: Processes', 'Lesson: Process IDs'],
  explanation: `
### How It Works

This program instruments process execution at the kernel level:

1. **\`SEC("tracepoint/sched/sched_process_exec")\`**: Attaches to the kernel process scheduler tracepoint triggered immediately after a process replaces its memory space via \`execve(2)\`.
2. **\`bpf_get_current_comm()\`**: A helper function copying the 16-byte command name string of the current process into our stack buffer.
3. **Low-Overhead Tracing**: Because this runs directly in Ring 0 before returning to user space, transient processes that finish in sub-milliseconds are captured without missing events.
  `,
  starterSource: `// BPFQuest — Trace Process Execution
// Captures process spawns via sched_process_exec

#include "vmlinux.h"
#include <bpf/bpf_helpers.h>

SEC("tracepoint/sched/sched_process_exec")
int handle_exec(struct trace_event_raw_sched_process_exec *ctx)
{
    u64 pid_tgid = bpf_get_current_pid_tgid();
    u32 pid = pid_tgid >> 32;

    // Buffer for process command name (Linux TASK_COMM_LEN is 16)
    char comm[16];
    bpf_get_current_comm(&comm, sizeof(comm));

    bpf_printk("EXEC EVENT -> PID: %d, COMM: %s\\n", pid, comm);

    return 0;
}

char LICENSE[] SEC("license") = "Dual BSD/GPL";
`,
  sampleOutput: `STATUS: SIMULATED ENVIRONMENT (Stage 7 MicroVM Lab Runner Coming Soon)

$ bpfquest compile trace_process.bpf.c
$ bpfquest attach sched:sched_process_exec

[Example Output - Not live kernel execution]
PID     PPID    COMMAND         EVENT
5120    1       node            sched_process_exec
5121    5120    git             sched_process_exec
5122    5120    sh              sched_process_exec
5123    5122    uname           sched_process_exec
`,
};
