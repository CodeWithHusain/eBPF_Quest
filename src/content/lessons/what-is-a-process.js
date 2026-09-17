/**
 * Lesson Definition: What is a Process?
 * Course: Linux Fundamentals | Module: Processes
 */

export const whatIsAProcessLesson = {
  id: 'lesson-what-is-a-process',
  courseSlug: 'linux-fundamentals',
  moduleSlug: 'processes',
  title: 'What is a Process?',
  slug: 'what-is-a-process',
  description:
    'Examine what constitutes a process in Linux: virtual address spaces, memory segments (text, data, heap, stack), and the kernel task_struct.',
  difficulty: 'BEGINNER',
  estimatedMinutes: 18,
  prerequisites: [
    'Linux Environment and Filesystems modules',
  ],
  objectives: [
    'Define a process as an active program instance with isolated virtual memory.',
    'Understand memory segments: Text, Data, BSS, Heap, and Stack.',
    'Explore the Linux kernel task_struct (the fundamental unit of tracing in eBPF).',
  ],
  content: `
### Program vs Process

A **program** is a passive binary file stored on disk (an ELF binary on Linux). A **process** is an active, running instance of that program in execution, equipped with:
- Its own private **Virtual Address Space** (isolated by CPU page tables and MMU).
- One or more execution threads sharing that address space.
- Open file descriptors, credentials (UID/GID), and signal handlers.

### Virtual Memory Segments

When the kernel loads an ELF binary via \`execve(2)\`, it maps virtual memory into distinct segments:

\`\`\`text
0xFFFFFFFFFFFFFFFF ┌──────────────────────────────────────┐ (Kernel Space: accessible only in Ring 0)
                   ├──────────────────────────────────────┤
0x7FFFFFFFFFFF     │ Stack (grows downward: local vars)   │
                   │               ▼                      │
                   │                                      │
                   │               ▲                      │
                   │ Heap (grows upward: malloc/brk)      │
                   ├──────────────────────────────────────┤
                   │ BSS (uninitialized global variables) │
                   ├──────────────────────────────────────┤
                   │ Data (initialized global variables)  │
                   ├──────────────────────────────────────┤
0x0000000000400000 │ Text Segment (executable machine code│
                   └──────────────────────────────────────┘
\`\`\`

### The Kernel task_struct: Heart of eBPF Tracing

Inside the kernel, every process and thread is tracked by a giant C struct: **\`struct task_struct\`** (defined in \`<linux/sched.h>\`).

It contains:
- Process ID (\`pid\`) and Thread Group ID (\`tgid\`)
- Execution state (\`TASK_RUNNING\`, \`TASK_INTERRUPTIBLE\`, etc.)
- Memory descriptor pointer (\`mm_struct\`)
- Open files table (\`files_struct\`)
- Security credentials (\`struct cred\`)

In eBPF, the helper function **\`bpf_get_current_task()\`** returns a direct pointer to the running \`task_struct\`, allowing eBPF tracing programs to inspect process names, PIDs, and credentials in nanoseconds!
  `,
  terminalCommands: [
    {
      title: 'Inspecting Memory Maps of a Process',
      command: 'head -n 6 /proc/$$/maps',
      output: '561d36d00000-561d36d2c000 r--p 00000000 08:02 524310 /usr/bin/bash\n561d36d2c000-561d36e25000 r-xp 0002c000 08:02 524310 /usr/bin/bash\n561d36e25000-561d36e78000 r--p 00125000 08:02 524310 /usr/bin/bash\n561d36e78000-561d36e84000 rw-p 00177000 08:02 524310 /usr/bin/bash\n561d3889c000-561d3897b000 rw-p 00000000 00:00 0 [heap]\n7ffca545b000-7ffca547c000 rw-p 00000000 00:00 0 [stack]',
    },
  ],
  codeExamples: [
    {
      language: 'c',
      title: 'eBPF Helper: Reading task_struct Information',
      code: `// Modern eBPF program extracting process information
#include <vmlinux.h>
#include <bpf/bpf_helpers.h>

SEC("kprobe/sys_enter_openat")
int trace_open(void *ctx) {
    struct task_struct *task = (struct task_struct *)bpf_get_current_task();
    char comm[16];
    bpf_get_current_comm(&comm, sizeof(comm));
    bpf_printk("Process %s is opening a file\\n", comm);
    return 0;
}`,
    },
  ],
  hints: [
    'Remember that bpf_get_current_task() gives eBPF programs direct access to the kernel task_struct.',
  ],
  knowledgeCheck: {
    title: 'Process Architecture Check',
    type: 'multiple-choice',
    prompt: 'Which kernel C structure represents an active process and thread in the Linux scheduler?',
    options: ['struct task_struct', 'struct process_node', 'struct sched_entity_proc', 'struct thread_info_blob'],
    correctAnswer: 'struct task_struct',
    explanation:
      'In the Linux kernel, struct task_struct (often called the process descriptor) contains all information regarding a process or thread, including PID, state, memory maps, files, and credentials.',
  },
  resources: [
    {
      title: 'Linux Kernel: struct task_struct Reference',
      url: 'https://elixir.bootlin.com/linux/latest/source/include/linux/sched.h',
    },
    {
      title: 'Memory Layout of C Programs (GeeksforGeeks)',
      url: 'https://www.geeksforgeeks.org/memory-layout-of-c-program/',
    },
  ],
};

export default whatIsAProcessLesson;
