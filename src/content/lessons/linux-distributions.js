/**
 * Lesson Definition: Linux Distributions
 * Course: Linux Fundamentals | Module: Linux Environment
 */

export const linuxDistributionsLesson = {
  id: 'lesson-linux-distributions',
  courseSlug: 'linux-fundamentals',
  moduleSlug: 'linux-environment',
  title: 'Linux Distributions',
  slug: 'linux-distributions',
  description:
    'Distinguish between the upstream Linux kernel, C standard libraries, init systems, and userland distributions, and learn how kernel configuration enables modern eBPF.',
  difficulty: 'BEGINNER',
  estimatedMinutes: 12,
  prerequisites: [
    'What is Linux?',
  ],
  objectives: [
    'Distinguish between the upstream Linux kernel and userland distributions.',
    'Understand glibc vs musl libc interfaces and system call wrappers.',
    'Identify kernel configuration options required for eBPF (CONFIG_BPF=y, BTF).',
  ],
  content: `
### Upstream Kernel vs Distributions

Strictly speaking, **Linux** refers solely to the kernel—originally created by Linus Torvalds in 1991. A complete operating system distribution (distro) combines:

1. **The Linux Kernel**: Core process scheduling, memory virtualization, device drivers, and networking.
2. **C Standard Library (libc)**: Provides the standard POSIX API wrapper around system calls. Most server distributions (Ubuntu, Debian, Fedora, RHEL) use **glibc**, while minimalist container distributions (like Alpine Linux) use **musl**.
3. **Core System Utilities**: GNU Coreutils (e.g. \`ls\`, \`cat\`, \`cp\`, \`chmod\`).
4. **Init System**: Modern Linux standardizes on **systemd** (PID 1) to manage daemons, cgroups, and service lifecycles.
5. **Package Managers**: APT (Debian/Ubuntu), DNF/RPM (RHEL/Fedora), or Pacman (Arch).

### Why Distribution Differences Matter for eBPF

While day-to-day user tools differ across distributions, **eBPF interacts directly with the kernel ABI**. To run modern eBPF programs, the distribution must provide a sufficiently modern kernel and enable specific build configurations:

- \`CONFIG_BPF=y\`: Enables the core BPF subsystem.
- \`CONFIG_BPF_SYSCALL=y\`: Exposes the \`bpf(2)\` system call used to load programs and manage BPF maps.
- \`CONFIG_BPF_JIT=y\`: Enables the Just-In-Time compiler translating BPF bytecode to native host machine code.
- \`CONFIG_DEBUG_INFO_BTF=y\`: Embeds **BPF Type Format (BTF)** data in the kernel binary, allowing **CO-RE (Compile Once – Run Everywhere)**.
  `,
  terminalCommands: [
    {
      title: 'Checking Kernel Build Configuration for BPF Support',
      command: 'grep -E "CONFIG_BPF|CONFIG_DEBUG_INFO_BTF" /boot/config-$(uname -r) | head -n 4',
      output: 'CONFIG_BPF=y\nCONFIG_BPF_SYSCALL=y\nCONFIG_BPF_JIT=y\nCONFIG_DEBUG_INFO_BTF=y',
    },
    {
      title: 'Verifying BTF (BPF Type Format) Availability',
      command: 'ls -lh /sys/kernel/btf/vmlinux',
      output: '-r--r--r-- 1 root root 5.2M Sep 16 04:00 /sys/kernel/btf/vmlinux',
    },
  ],
  codeExamples: [
    {
      language: 'bash',
      title: 'Inspecting C Library Version on Ubuntu / Debian',
      code: `# Query installed glibc version
ldd --version | head -n 1`,
    },
  ],
  hints: [
    'Look for the BTF keyword in modern kernel configs.',
    'BTF replaces the older requirement of installing 200MB+ kernel headers on production servers.',
  ],
  knowledgeCheck: {
    title: 'Distribution & Kernel Config Check',
    type: 'multiple-choice',
    prompt: 'Which kernel configuration flag is required for modern BPF CO-RE (Compile Once – Run Everywhere) portability?',
    options: ['CONFIG_DEBUG_INFO_BTF=y', 'CONFIG_BPF_NETWORK=y', 'CONFIG_GLIBC_BTF=y', 'CONFIG_MODVERSIONS=y'],
    correctAnswer: 'CONFIG_DEBUG_INFO_BTF=y',
    explanation:
      'CONFIG_DEBUG_INFO_BTF=y embeds BPF Type Format (BTF) type metadata directly inside the kernel at /sys/kernel/btf/vmlinux, enabling libbpf to perform runtime field relocations.',
  },
  resources: [
    {
      title: 'Kernel Newbies: Kernel Build Options',
      url: 'https://kernelnewbies.org/',
    },
    {
      title: 'BPF CO-RE Reference Guide (Andrii Nakryiko)',
      url: 'https://nakryiko.com/posts/bpf-core-reference-guide/',
    },
  ],
};

export default linuxDistributionsLesson;
