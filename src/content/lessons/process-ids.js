/**
 * Lesson Definition: Process IDs
 * Course: Linux Fundamentals | Module: Processes
 */

export const processIdsLesson = {
  id: 'lesson-process-ids',
  courseSlug: 'linux-fundamentals',
  moduleSlug: 'processes',
  title: 'Process IDs',
  slug: 'process-ids',
  description:
    'Explore Process IDs (PID), Thread Group IDs (TGID), PID 1 (init/systemd), PID namespaces in containers, and the per-process /proc/[pid] directory.',
  difficulty: 'BEGINNER',
  estimatedMinutes: 15,
  prerequisites: [
    'What is a Process?',
  ],
  objectives: [
    'Understand PID assignment, PID recycling, and PID 1 initialization.',
    'Differentiate between PID and TGID (POSIX Process ID vs Linux Kernel Thread ID).',
    'Examine how containers utilize PID namespaces to isolate processes.',
  ],
  content: `
### Process ID (PID) & Thread Group ID (TGID)

In Linux, every thread and process scheduled by the kernel is assigned a numeric identifier:

- **PID (Process ID in userspace)**: What POSIX calls a process.
- **TGID (Thread Group ID)**: In the kernel, threads created with \`clone(CLONE_THREAD)\` share the same TGID (which matches the PID of the initial thread).
  - In user space (via \`getpid()\`), the library returns the **TGID**.
  - In user space (via \`gettid()\`), the library returns the kernel's actual thread **PID**!
- In eBPF: The helper \`bpf_get_current_pid_tgid()\` returns a 64-bit integer packing both:
  - Upper 32 bits: **TGID** (userspace PID)
  - Lower 32 bits: **PID** (kernel TID)

### PID 1: The Ancestor of All Processes

When the kernel finishes booting, it spawns **PID 1** (typically \`/sbin/init\` or \`/lib/systemd/systemd\`).
- PID 1 never dies during normal operation; if PID 1 exits, the kernel panics.
- PID 1 adopts orphaned child processes whose parents died before reaping them.

### PID Namespaces (The Magic Behind Docker)

A **PID Namespace** provides virtualized isolation of PIDs:
- Inside a Docker container, the container entrypoint process has **PID 1**.
- On the host machine outside the container, that exact same process has a standard host PID (e.g. PID 28410).
- eBPF can track both host PIDs and namespace-specific PIDs simultaneously!
  `,
  terminalCommands: [
    {
      title: 'Inspecting PID 1 on the Host',
      command: 'ps -p 1 -o pid,comm,stat',
      output: '  PID COMMAND         STAT\n    1 systemd         Ss',
    },
    {
      title: 'Viewing Maximum Process ID Allowed by Kernel',
      command: 'cat /proc/sys/kernel/pid_max',
      output: '4194304',
    },
  ],
  codeExamples: [
    {
      language: 'c',
      title: 'Extracting PID and TGID in eBPF',
      code: `// Unpacking 64-bit PID/TGID integer
u64 pid_tgid = bpf_get_current_pid_tgid();
u32 tgid = pid_tgid >> 32;     // Userspace Process ID
u32 pid = (u32)pid_tgid;        // Kernel Thread ID`,
    },
  ],
  hints: [
    'Always remember in eBPF: bpf_get_current_pid_tgid() >> 32 gives you the PID seen in user space ps/top.',
  ],
  knowledgeCheck: {
    title: 'Process IDs Check',
    type: 'multiple-choice',
    prompt: 'In modern Linux eBPF programming, which 32-bit portion of `bpf_get_current_pid_tgid()` corresponds to the userspace Process ID (PID)?',
    options: ['The upper 32 bits (TGID)', 'The lower 32 bits (PID)', 'The middle 16 bits', 'Bits 0 through 15'],
    correctAnswer: 'The upper 32 bits (TGID)',
    explanation:
      'In Linux kernel terminology, the Thread Group ID (TGID) represents the process as a whole, which is packed into the upper 32 bits of bpf_get_current_pid_tgid().',
  },
  resources: [
    {
      title: 'getpid(2) / gettid(2) — Linux manual page',
      url: 'https://man7.org/linux/man-pages/man2/getpid.2.html',
    },
    {
      title: 'pid_namespaces(7) — Linux manual page',
      url: 'https://man7.org/linux/man-pages/man7/pid_namespaces.7.html',
    },
  ],
};

export default processIdsLesson;
