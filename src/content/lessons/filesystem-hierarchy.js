/**
 * Lesson Definition: Linux Filesystem Hierarchy
 * Course: Linux Fundamentals | Module: Files & Filesystems
 */

export const filesystemHierarchyLesson = {
  id: 'lesson-filesystem-hierarchy',
  courseSlug: 'linux-fundamentals',
  moduleSlug: 'files-and-filesystems',
  title: 'Linux Filesystem Hierarchy',
  slug: 'filesystem-hierarchy',
  description:
    'Explore the Filesystem Hierarchy Standard (FHS), root directory layout, and kernel pseudo-filesystems (/proc, /sys, /dev) that expose live kernel states as virtual files.',
  difficulty: 'BEGINNER',
  estimatedMinutes: 15,
  prerequisites: [
    'Linux Environment module',
  ],
  objectives: [
    'Navigate the Filesystem Hierarchy Standard (FHS).',
    'Understand pseudo-filesystems (/proc, /sys, /dev) vs block storage.',
    'Inspect kernel runtime state through /proc and device attributes through /sys.',
    'Understand how eBPF hooks into the Virtual File System (VFS).',
  ],
  content: `
### The Single Root Hierarchy

Unlike Windows (which maps disks to distinct drive letters like \`C:\` and \`D:\`), Linux arranges all storage beneath a single root directory: \`/\`.

Storage devices, network mounts, and memory-backed kernel states are unified through the **Virtual File System (VFS)**:

- \`/bin\` and \`/usr/bin\`: Essential system executable binaries.
- \`/etc\`: System-wide configuration files (e.g. \`/etc/passwd\`, \`/etc/hosts\`).
- \`/var\`: Variable data (e.g. system logs in \`/var/log\`, caches, spools).
- \`/home\`: User home directories.
- \`/boot\`: Kernel binaries (\`vmlinuz\`), initramfs images, and bootloader configuration.

### Kernel Pseudo-Filesystems: /proc, /sys, /dev

One of Unix's deepest design tenets is: *"Everything is a file"*. The kernel exposes dynamic internal states using in-memory pseudo-filesystems:

1. **\`/proc\` (Process Information Pseudo-filesystem)**:
   - Contains virtual files reflecting active kernel parameters and running processes.
   - For example, \`/proc/cpuinfo\`, \`/proc/meminfo\`, and per-PID directories like \`/proc/1/status\`.
   - None of these files reside on disk; reading them causes the kernel to query internal C structs and format text into your buffer on the fly!
2. **\`/sys\` (sysfs)**:
   - Exposes the kernel's unified device model, bus hierarchies, and power states.
   - Used by eBPF to discover kprobe events and tracepoints under \`/sys/kernel/debug/tracing/\`.
3. **\`/dev\` (devtmpfs)**:
   - Device nodes representing hardware or virtual drivers (e.g. block devices like \`/dev/nvme0n1\`, random number generators like \`/dev/urandom\`, and PTYs under \`/dev/pts/\`).
  `,
  terminalCommands: [
    {
      title: 'Reading Kernel Memory Stats from /proc/meminfo',
      command: 'grep -E "^(MemTotal|MemFree|MemAvailable):" /proc/meminfo',
      output: 'MemTotal:       16301228 kB\nMemFree:         4892100 kB\nMemAvailable:   12104520 kB',
    },
    {
      title: 'Inspecting eBPF Tracing Mount under sysfs',
      command: 'ls /sys/kernel/debug/tracing/ | head -n 5',
      output: 'available_events\navailable_filter_functions\navailable_tracers\nbuffer_size_kb\ncurrent_tracer',
    },
  ],
  codeExamples: [
    {
      language: 'bash',
      title: 'Querying Process Commandline from /proc',
      code: `# Read null-delimited arguments of PID 1 (systemd)
tr '\\0' ' ' < /proc/1/cmdline`,
    },
  ],
  hints: [
    'Files in /proc and /sys consume 0 bytes of physical disk space—they are generated in RAM by kernel callbacks.',
  ],
  knowledgeCheck: {
    title: 'Filesystem Hierarchy Check',
    type: 'multiple-choice',
    prompt: 'Which pseudo-filesystem dynamically presents the kernel device model and hardware attributes?',
    options: ['/sys', '/etc', '/var', '/opt'],
    correctAnswer: '/sys',
    explanation:
      'The /sys directory is the mountpoint for sysfs, an in-memory virtual filesystem that exports kernel data structures, device drivers, and system bus hierarchies to userspace.',
  },
  resources: [
    {
      title: 'Filesystem Hierarchy Standard (Linux Foundation)',
      url: 'https://refspecs.linuxfoundation.org/fhs.shtml',
    },
    {
      title: 'proc(5) — Linux manual page',
      url: 'https://man7.org/linux/man-pages/man5/proc.5.html',
    },
  ],
};

export default filesystemHierarchyLesson;
