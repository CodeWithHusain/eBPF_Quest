/**
 * Lesson Definition: What is Linux?
 * Course: Linux Fundamentals | Module: Linux Environment
 */

export const whatIsLinuxLesson = {
  id: 'lesson-what-is-linux',
  courseSlug: 'linux-fundamentals',
  moduleSlug: 'linux-environment',
  title: 'What is Linux?',
  slug: 'what-is-linux',
  description:
    'Understand the architecture of a Linux system, the monolithic kernel, hardware privilege rings, and how user space applications interface with kernel space via system calls.',
  difficulty: 'BEGINNER',
  estimatedMinutes: 15,
  prerequisites: [
    'Basic command-line familiarity',
    'Understanding of what an operating system does',
  ],
  objectives: [
    'Understand the boundary between User Space (Ring 3) and Kernel Space (Ring 0).',
    'Explain how the monolithic kernel coordinates CPU, memory, and devices.',
    'Trace system calls (syscalls) mediating the user-to-kernel boundary.',
    'Understand why eBPF enables safe, in-kernel programmability without kernel panics.',
  ],
  content: `
### The Monolithic Architecture of Linux

At its foundational level, Linux is a **monolithic, Unix-like operating system kernel**. The kernel is loaded into memory during system boot and remains resident for the entire duration of system uptime. Its core responsibility is to arbitrate access to physical hardware (CPU, RAM, block storage, network devices) and provide an isolated execution environment for user processes.

On x86_64 and ARM64 architectures, hardware enforces CPU privilege levels known as protection rings:

1. **Ring 3 (User Space)**: Where unprivileged applications (bash, web servers, databases, compilers) run. User space processes cannot execute privileged CPU instructions (such as disabling interrupts or modifying page tables) or directly touch raw physical memory.
2. **Ring 0 (Kernel Space)**: Where the core Linux kernel executes with unrestricted, direct access to the CPU, physical memory, device registers, and interrupt vectors.

### Crossing the Boundary: The System Call

Because user space processes cannot directly manipulate storage or network interfaces, every I/O interaction requires crossing into the kernel via a **System Call (syscall)**.

When a program invokes a syscall (such as \`write(2)\` or \`socket(2)\`):
1. Arguments are loaded into designated CPU registers (on x86_64: \`%rax\` holds the syscall number; \`%rdi\`, \`%rsi\`, \`%rdx\` hold arguments).
2. The CPU executes the \`syscall\` instruction, triggering a hardware-assisted context transition from Ring 3 to Ring 0.
3. The kernel validates pointer addresses, switches to the kernel stack, dispatches to the registered handler, executes the requested operation, and returns control to user space with \`sysret\`.

### Why This Matters for eBPF

Historically, extending or observing kernel behavior required writing a **Loadable Kernel Module (LKM)**. However, LKMs run in Ring 0 without safety boundaries. A single memory corruption bug or NULL pointer dereference in an LKM will trigger a **kernel panic** and crash the entire production system.

**eBPF (Extended Berkeley Packet Filter)** introduced a verified, sandboxed virtual machine inside the Linux kernel. With eBPF, developers write C programs that are mathematically proven safe by the in-kernel verifier at load time. You can safely inspect system calls, trace memory latencies, filter network packets, and drop DDoS attacks directly inside Ring 0 without risk of crashing the machine.
  `,
  terminalCommands: [
    {
      title: 'Inspecting the Running Kernel Release',
      command: 'uname -srm',
      output: 'Linux 6.8.0-40-generic x86_64',
    },
    {
      title: 'Inspecting System Information via /proc',
      command: 'head -n 2 /proc/version',
      output: 'Linux version 6.8.0-40-generic (x86_64-linux-gnu-gcc-13) SMP PREEMPT_DYNAMIC',
    },
  ],
  codeExamples: [
    {
      language: 'c',
      title: 'Direct Syscall Transition Example in C',
      code: `// Minimal C program making a raw write(2) syscall
#include <unistd.h>
#include <sys/syscall.h>

int main() {
    const char msg[] = "Hello from Linux Kernel Syscall Boundary!\\n";
    // Syscall #1 on x86_64 is sys_write(fd, buf, count)
    syscall(SYS_write, 1, msg, sizeof(msg) - 1);
    return 0;
}`,
    },
    {
      language: 'bash',
      title: 'Inspecting Syscalls with strace',
      code: `# Trace system calls performed by the ls command
strace -e trace=write,openat ls -lh /etc/hosts`,
    },
  ],
  hints: [
    'Think about hardware safety: if any web app could write directly to physical memory, malicious code could rewrite the operating system.',
    'eBPF programs are verified at load time before running in Ring 0, preventing kernel panics.',
  ],
  knowledgeCheck: {
    title: 'Kernel Privilege & Architecture Check',
    type: 'multiple-choice',
    prompt: 'In standard x86 CPU architecture, which execution privilege ring does the Linux kernel run in?',
    options: ['Ring 3', 'Ring 1', 'Ring 0', 'Ring 2'],
    correctAnswer: 'Ring 0',
    explanation:
      'The Linux kernel executes in Ring 0 (Kernel Space), granting it unrestricted access to physical hardware and memory. Applications execute in Ring 3 (User Space).',
  },
  resources: [
    {
      title: 'Linux Kernel Documentation: System Calls',
      url: 'https://docs.kernel.org/process/adding-syscalls.html',
    },
    {
      title: 'eBPF Official Overview',
      url: 'https://ebpf.io/what-is-ebpf/',
    },
    {
      title: 'The Linux Kernel: Architecture Overview (OS Dev Wiki)',
      url: 'https://wiki.osdev.org/Monolithic_Kernel',
    },
  ],
};

export default whatIsLinuxLesson;
