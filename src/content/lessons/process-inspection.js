/**
 * Lesson Definition: Process Inspection
 * Course: Linux Fundamentals | Module: Processes
 */

export const processInspectionLesson = {
  id: 'lesson-process-inspection',
  courseSlug: 'linux-fundamentals',
  moduleSlug: 'processes',
  title: 'Process Inspection',
  slug: 'process-inspection',
  description:
    'Inspect live processes using ps, top, htop, lsof, and directly querying kernel diagnostic files under /proc/[pid]/status and /proc/[pid]/smaps.',
  difficulty: 'BEGINNER',
  estimatedMinutes: 20,
  prerequisites: [
    'Signals',
  ],
  objectives: [
    'Master practical process inspection commands (ps aux, top, pstree).',
    'Read and interpret process state metrics in /proc/[pid]/status.',
    'Inspect open network and file connections using lsof and fuser.',
  ],
  content: `
### Investigating Running Processes

Every tool you run to view processes—whether \`ps\`, \`top\`, \`htop\`, or Prometheus node-exporter—functions simply by reading virtual files under **\`/proc/[pid]/\`**.

### Key Fields in /proc/[pid]/status

Inspecting \`/proc/[pid]/status\` reveals live kernel accounting for that process:
- **State**: Current lifecycle status:
  - \`R (running / runnable)\`: Actively executing on a CPU or waiting on runqueue.
  - \`S (sleeping / interruptible)\`: Waiting for an event (socket read, disk I/O, timer).
  - \`D (disk sleep / uninterruptible)\`: Blocked in an uninterruptible kernel wait (usually waiting on NFS or disk I/O). Signals cannot wake a process in D state!
  - \`Z (zombie)\`: Terminated, waiting for parent to reap.
- **VmRSS**: Resident Set Size—physical RAM currently occupied by the process.
- **Threads**: Count of threads executing within this thread group.
- **voluntary_ctxt_switches**: Number of times the process yielded the CPU willingly.
  `,
  terminalCommands: [
    {
      title: 'Querying Process Status Flags for PID 1',
      command: 'grep -E "^(Name|State|VmRSS|Threads):" /proc/1/status',
      output: 'Name:   systemd\nState:  S (sleeping)\nVmRSS:     13420 kB\nThreads: 1',
    },
    {
      title: 'Listing Processes with High Memory Consumption',
      command: 'ps aux --sort=-%mem | head -n 4',
      output: 'USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\nroot       810  0.1  2.4 128490 41200 ?        Ssl  10:00   0:05 /usr/bin/dockerd\nbpfquest  1204  0.0  0.8  22410 13400 pts/2    Ss   10:15   0:00 -bash',
    },
  ],
  codeExamples: [
    {
      language: 'bash',
      title: 'Inspecting All Network Sockets Opened by a Specific Process',
      code: `# Use lsof to view network listeners and established connections
lsof -i -P -n -p 810`,
    },
  ],
  hints: [
    'A process in "D" state (uninterruptible sleep) cannot be killed with kill -9; it will only exit once the underlying I/O completes or times out.',
  ],
  knowledgeCheck: {
    title: 'Process Inspection Check',
    type: 'multiple-choice',
    prompt: 'What does a process state of `D` in `ps` or `/proc/[pid]/status` indicate?',
    options: [
      'Uninterruptible sleep (usually waiting on hardware or disk I/O)',
      'Detached daemon process',
      'Defunct zombie process',
      'Debug trace active under gdb',
    ],
    correctAnswer: 'Uninterruptible sleep (usually waiting on hardware or disk I/O)',
    explanation:
      'The D state indicates Uninterruptible Sleep. The process is waiting inside a kernel driver routine for a hardware or I/O condition to resolve and will ignore all signals (even SIGKILL) until the wait completes.',
  },
  resources: [
    {
      title: 'ps(1) — Linux manual page',
      url: 'https://man7.org/linux/man-pages/man1/ps.1.html',
    },
    {
      title: 'lsof(8) — Linux manual page',
      url: 'https://man7.org/linux/man-pages/man8/lsof.8.html',
    },
  ],
};

export default processInspectionLesson;
