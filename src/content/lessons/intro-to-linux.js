/**
 * Lesson Definition: Introduction to Linux Kernel Architecture
 * Foundational lesson demonstrating the complete lesson model.
 */

export const introToLinuxLesson = {
  id: 'lesson-intro-to-linux',
  courseSlug: 'linux-fundamentals',
  moduleSlug: 'kernel-architecture-and-syscalls',
  title: 'Introduction to Linux Kernel Architecture',
  slug: 'intro-to-linux',
  description:
    'Discover the dual-mode architecture of Linux, separating user space from kernel space, and understand how the system call interface mediates privilege boundaries.',
  difficulty: 'BEGINNER',
  estimatedTime: '15 mins',
  prerequisites: [
    'Basic command-line familiarity',
    'Understanding of what an operating system does',
  ],
  objectives: [
    'Differentiate between User Space (Ring 3) and Kernel Space (Ring 0).',
    'Explain how system calls (syscalls) transition execution privilege.',
    'Understand why eBPF revolutionized observability by safely running sandboxed bytecode inside Ring 0.',
  ],
  content: `
### The Two Rings of Linux

The Linux operating system runs on x86_64 and ARM64 architectures by dividing execution privilege into hardware privilege levels. On x86 architectures, these are known as CPU protection rings:

1. **Ring 3 (User Space)**: Where regular applications (browsers, shells, databases, web servers) run. Code running here has limited hardware access and cannot touch raw physical memory or device registers directly.
2. **Ring 0 (Kernel Space)**: Where the core Linux kernel executes. Code here has unrestricted access to hardware, CPU registers, interrupt handlers, and physical memory.

### Crossing the Boundary: The System Call

When a user space program needs to write data to disk or send a network packet, it cannot do so directly. Instead, it triggers a **System Call** (e.g., \`sys_enter_write\` or \`sys_enter_sendto\`).

The CPU switches execution privilege from Ring 3 to Ring 0, transitions the stack, runs the kernel's verified syscall handler, and switches back.

### Where Does eBPF Fit?

Traditionally, extending kernel behavior required either:
- **Writing a Kernel Module (LKM)**: Risky, prone to kernel panics, and security crashes.
- **Modifying the Kernel Source**: Slow release cycles requiring kernel re-compilation and reboots.

**eBPF (Extended Berkeley Packet Filter)** introduced an in-kernel sandboxed virtual machine with an instruction verifier. It allows engineers to dynamically run verified bytecode inside kernel space upon tracepoints, kprobes, or network socket events—without crashing the machine.
  `,
  codeExamples: [
    {
      language: 'c',
      title: 'Direct Syscall Transition Example',
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
strace -e trace=write,openat ls -lh`,
    },
  ],
  hints: [
    'Think about what would happen if any user program could directly overwrite memory in physical RAM without kernel arbitration.',
    'The eBPF verifier proves safety (no out-of-bounds memory access, bounded loops) before code ever executes.',
  ],
  challenge: {
    title: 'Syscall Identification Challenge',
    prompt: 'Which x86_64 CPU register holds the syscall number during a syscall transition?',
    type: 'multiple-choice',
    options: ['%rax', '%rdi', '%rsp', '%rip'],
    correctAnswer: '%rax',
    explanation:
      'On x86_64 Linux ABI, the syscall number is passed in the %rax register, with arguments passed in %rdi, %rsi, %rdx, %r10, %r8, and %r9.',
  },
  knowledgeCheck: {
    title: 'Syscall Identification Check',
    prompt: 'Which x86_64 CPU register holds the syscall number during a syscall transition?',
    type: 'multiple-choice',
    options: ['%rax', '%rdi', '%rsp', '%rip'],
    correctAnswer: '%rax',
    explanation:
      'On x86_64 Linux ABI, the syscall number is passed in the %rax register, with arguments passed in %rdi, %rsi, %rdx, %r10, %r8, and %r9.',
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

export default introToLinuxLesson;
