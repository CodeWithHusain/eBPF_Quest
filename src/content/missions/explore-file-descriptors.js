/**
 * Mission Definition: Explore File Descriptors
 * Category: LINUX | Difficulty: BEGINNER
 * Connected Lesson: file-descriptors
 */

export const exploreFileDescriptorsMission = {
  id: 'mission-explore-file-descriptors',
  slug: 'explore-file-descriptors',
  title: 'Explore File Descriptors',
  shortDescription:
    'Investigate open file handles, standard I/O streams, and network socket descriptors in /proc/[pid]/fd.',
  description:
    'A backend logging worker process has reported a "Too many open files" error (EMFILE). Investigate the running daemon, inspect its open file descriptor table in /proc/<pid>/fd, differentiate between regular file descriptors and socket descriptors, and identify which log file is leaking handles.',
  category: 'LINUX',
  difficulty: 'BEGINNER',
  estimatedMinutes: 15,
  points: 100,
  order: 2,
  isPublished: true,
  lessonSlug: 'file-descriptors',
  story: `
In Linux, "everything is a file" means regular disk files, directories, character devices, pipes, and network sockets are all accessed via integer indices known as file descriptors (FDs).

When process 'log_shipper' hits its soft file descriptor limit (\`ulimit -n\`), it fails to accept new connections or write out customer events. You must inspect the process's file descriptor table in \`/proc/<PID>/fd\` to trace where open handles are accumulating and identify the leaking target.
  `,
  objectives: [
    {
      id: 'obj-1',
      title: 'Inspect standard I/O streams (FD 0, 1, 2)',
      description: 'Confirm the targets of stdin, stdout, and stderr for the target process.',
      order: 1,
      validationKey: 'STDIO_STREAMS_VERIFIED',
    },
    {
      id: 'obj-2',
      title: 'Identify leaking file descriptor handles',
      description: 'List the symbolic links in /proc/<pid>/fd to locate the duplicate unclosed file targets.',
      order: 2,
      validationKey: 'FD_LEAK_IDENTIFIED',
    },
    {
      id: 'obj-3',
      title: 'Inspect socket file descriptors',
      description: 'Distinguish socket:[inode] references from regular POSIX file handles.',
      order: 3,
      validationKey: 'SOCKET_INODES_MAPPED',
    },
  ],
  instructions: `
### Recommended Investigation Steps

1. Find the target process PID with \`pgrep -f log_shipper\`.
2. Inspect open descriptors with \`ls -la /proc/<PID>/fd\`.
3. Read the descriptor flags and positions via \`/proc/<PID>/fdinfo/<FD>\`.
4. Identify which logfile path is repeatedly opened without corresponding \`close(2)\` calls.
  `,
  successCriteria:
    'Identify the target file leaking file descriptors in /proc/<pid>/fd and verify the standard I/O streams.',
  prerequisites: [
    {
      type: 'COURSE',
      targetSlug: 'linux-fundamentals',
      title: 'Linux Fundamentals Course',
      order: 1,
    },
    {
      type: 'LESSON',
      targetSlug: 'file-descriptors',
      title: 'Lesson: File Descriptors & Standard Streams',
      order: 2,
    },
  ],
  hints: [
    {
      id: 'hint-1',
      order: 1,
      title: 'Viewing symbolic links in /proc/pid/fd',
      content:
        'Every entry in `/proc/<PID>/fd/` is a symbolic link pointing to the open file or pseudo-device. Use `ls -l /proc/<PID>/fd` to see where each integer points.',
    },
    {
      id: 'hint-2',
      order: 2,
      title: 'Checking fd limits with /proc/pid/limits',
      content:
        'The kernel records resource limits in `/proc/<PID>/limits`. Look for the "Max open files" line to find the exact threshold.',
    },
  ],
  sampleSolution: {
    processName: 'log_shipper',
    targetPid: '5120',
    leakingFile: '/var/log/app/audit_events.log',
    standardStream: 'fd 1 -> /dev/null',
  },
};
