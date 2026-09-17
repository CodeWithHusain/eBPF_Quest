/**
 * Mission Definition: Observe a Process
 * Category: LINUX | Difficulty: BEGINNER
 * Connected Lesson: what-is-a-process / process-inspection
 */

export const observeAProcessMission = {
  id: 'mission-observe-a-process',
  slug: 'observe-a-process',
  title: 'Observe a Process',
  shortDescription:
    'Investigate an active Linux background process and inspect its process hierarchy and memory metadata.',
  description:
    'A rogue maintenance daemon is generating high CPU utilization and unexpected disk queries. Your task as a systems reliability engineer is to identify the process, examine its /proc directory, determine its PID and Parent PID (PPID), and explain your observations using standard Linux process inspection utilities.',
  category: 'LINUX',
  difficulty: 'BEGINNER',
  estimatedMinutes: 15,
  points: 100,
  order: 1,
  isPublished: true,
  lessonSlug: 'what-is-a-process',
  story: `
During an on-call shift, your observability dashboard alerts on erratic system activity on node 'worker-prod-04'. An uncataloged daemon named 'telemetry_collector' is spinning in the background.

Before terminating or modifying the process, you must safely inspect its state. You need to identify its unique Process ID (PID), its Parent Process ID (PPID) to see which service spawned it, and read its virtual memory status directly from the kernel via the /proc pseudofilesystem.
  `,
  objectives: [
    {
      id: 'obj-1',
      title: 'Identify the target process name and PID',
      description: 'Use ps or pgrep to locate the running telemetry process and record its PID.',
      order: 1,
      validationKey: 'TARGET_PID_IDENTIFIED',
    },
    {
      id: 'obj-2',
      title: 'Determine the Parent Process ID (PPID)',
      description: 'Trace the process hierarchy using ps -ef or pstree to identify which parent spawned it.',
      order: 2,
      validationKey: 'PARENT_PPID_VERIFIED',
    },
    {
      id: 'obj-3',
      title: 'Inspect process memory state via /proc',
      description: 'Inspect /proc/[pid]/status to examine state (State, VmSize, and Threads).',
      order: 3,
      validationKey: 'PROC_STATUS_INSPECTED',
    },
  ],
  instructions: `
### Recommended Investigation Steps

1. Run \`ps aux | grep telemetry\` or \`pgrep -l telemetry\` to find the running process.
2. Check the parent process tree with \`ps -o pid,ppid,cmd -p <PID>\` or \`pstree -p <PID>\`.
3. Inspect the kernel's virtual representation of the process by reading \`/proc/<PID>/status\`.
4. Formulate your solution in the Mission Workspace below.
  `,
  successCriteria:
    'Successfully identify the target process name, determine its parent PID, and confirm inspection of /proc/[pid]/status.',
  prerequisites: [
    {
      type: 'COURSE',
      targetSlug: 'linux-fundamentals',
      title: 'Linux Fundamentals Course',
      order: 1,
    },
    {
      type: 'LESSON',
      targetSlug: 'what-is-a-process',
      title: 'Lesson: What is a Process?',
      order: 2,
    },
    {
      type: 'LESSON',
      targetSlug: 'process-inspection',
      title: 'Lesson: Process Inspection (/proc & top)',
      order: 3,
    },
  ],
  hints: [
    {
      id: 'hint-1',
      order: 1,
      title: 'Locating the process by name',
      content:
        'The command `pgrep -a telemetry` or `ps aux | grep telemetry` prints all processes containing the search term along with their command line arguments and PIDs.',
    },
    {
      id: 'hint-2',
      order: 2,
      title: 'Finding the parent process ID',
      content:
        'The `ps -o pid,ppid,comm -p <PID>` command formats the output specifically to display both the process ID and its parent PPID.',
    },
    {
      id: 'hint-3',
      order: 3,
      title: 'Reading kernel /proc entries',
      content:
        'Every active task in the Linux kernel has a directory in `/proc/<PID>`. Check `/proc/<PID>/status` to see State (e.g. S (sleeping) or R (running)) and PPID.',
    },
  ],
  sampleSolution: {
    processName: 'telemetry_collector',
    targetPid: '4210',
    parentPid: '1',
    investigationTool: 'ps aux and /proc/4210/status',
  },
};
