/**
 * Playground Example: Hello eBPF
 * Category: Getting Started | Language: c
 */

export const helloEbpfExample = {
  id: 'example-hello-ebpf',
  slug: 'hello-ebpf',
  title: 'Hello eBPF',
  shortDescription: 'Minimal eBPF program printing debug trace messages to the kernel pipe.',
  category: 'Getting Started',
  difficulty: 'BEGINNER',
  language: 'c',
  order: 1,
  prerequisites: ['Basic C familiarity', 'Understanding of Linux kernel space'],
  explanation: `
### How It Works

This is the canonical starting point for in-kernel eBPF programming:

1. **\`vmlinux.h\`**: Generated via \`bpftool\`, containing the internal type definitions of the entire running Linux kernel.
2. **\`SEC("tracepoint/syscalls/sys_enter_write")\`**: The ELF section attribute telling \`libbpf\` which hook in the kernel to attach this compiled bytecode to. Every time any process calls the \`write(2)\` system call, the kernel executes this routine.
3. **\`bpf_printk()\`**: A kernel helper that outputs formatted text into the kernel tracing pipe (\`/sys/kernel/debug/tracing/trace_pipe\`).
4. **Return Value**: Returning \`0\` signifies successful execution and permits the kernel to proceed normally.
  `,
  starterSource: `// BPFQuest — Hello eBPF
// Minimal eBPF program hooked to sys_enter_write

#include "vmlinux.h"
#include <bpf/bpf_helpers.h>

// Section definition instructs libbpf where to attach the bytecode
SEC("tracepoint/syscalls/sys_enter_write")
int handle_write(struct trace_event_raw_sys_enter *ctx)
{
    // Retrieve current process ID and thread group ID
    u64 id = bpf_get_current_pid_tgid();
    u32 pid = id >> 32;

    // Output debug line to /sys/kernel/debug/tracing/trace_pipe
    bpf_printk("Hello from Linux Kernel! Syscall write triggered by PID: %d\\n", pid);

    return 0; // Return 0 = permit execution
}

// License required by the Linux kernel eBPF verifier
char LICENSE[] SEC("license") = "Dual BSD/GPL";
`,
  sampleOutput: `STATUS: SIMULATED ENVIRONMENT (Stage 7 MicroVM Lab Runner Coming Soon)

$ bpfquest compile hello_ebpf.bpf.c -o hello_ebpf.bpf.o
$ bpfquest load hello_ebpf.bpf.o

[Example Output - Not live kernel execution]
TIME            PID     COMM            MESSAGE
12:04:10.124    2411    cat             Hello from Linux Kernel! Syscall write triggered by PID: 2411
12:04:10.125    2411    cat             Hello from Linux Kernel! Syscall write triggered by PID: 2411
12:04:11.890    4021    bash            Hello from Linux Kernel! Syscall write triggered by PID: 4021
`,
};
