/**
 * Mission Definition: Trace a Process Event
 * Category: TRACING | Difficulty: INTERMEDIATE
 * Connected Course: eBPF Tracing & Observability
 */

export const traceAProcessEventMission = {
  id: 'mission-trace-a-process-event',
  slug: 'trace-a-process-event',
  title: 'Trace a Process Event',
  shortDescription:
    'Design a kernel tracing strategy to intercept process lifecycle events (execve and exit) without modifying binaries.',
  description:
    'Security compliance requires real-time monitoring whenever new short-lived processes are spawned on production database hosts. Traditional logging tools miss processes that terminate in milliseconds. Design a kernel tracing probe using tracepoints and kprobes to capture process execution events with zero overhead.',
  category: 'TRACING',
  difficulty: 'INTERMEDIATE',
  estimatedMinutes: 25,
  points: 150,
  order: 4,
  isPublished: true,
  lessonSlug: null,
  story: `
Attackers frequently run fast reconnaissance scripts that execute in under 5 milliseconds and exit immediately. Standard auditing tools polling \`/proc\` or \`ps\` will never see these transient tasks.

The Linux kernel provides static tracepoints such as \`sched:sched_process_exec\` and system call entry probes \`syscalls:sys_enter_execve\`. Your challenge is to analyze the event instrumentation points in \`/sys/kernel/debug/tracing\` and specify the probe definition that intercepts every \`execve(2)\` invocation along with its executable filename.
  `,
  objectives: [
    {
      id: 'obj-1',
      title: 'Identify the kernel execution tracepoint',
      description: 'Locate the exact tracepoint under /sys/kernel/debug/tracing/events/sched/.',
      order: 1,
      validationKey: 'TRACEPOINT_NAME_IDENTIFIED',
    },
    {
      id: 'obj-2',
      title: 'Inspect tracepoint event format',
      description: 'Examine the format file to identify field names for filename and PID.',
      order: 2,
      validationKey: 'EVENT_FORMAT_INSPECTED',
    },
    {
      id: 'obj-3',
      title: 'Specify the bpftrace/kprobe filter syntax',
      description: 'Formulate the probe expression to capture the calling PID and executable path.',
      order: 3,
      validationKey: 'PROBE_EXPRESSION_VERIFIED',
    },
  ],
  instructions: `
### Recommended Investigation Steps

1. Inspect available tracepoints in \`/sys/kernel/debug/tracing/available_events\`.
2. View the event layout with \`cat /sys/kernel/debug/tracing/events/sched/sched_process_exec/format\`.
3. Design a probe signature: \`tracepoint:sched:sched_process_exec { printf("%d %s\\n", pid, comm); }\`.
4. Submit your probe specification in the Mission Workspace.
  `,
  successCriteria:
    'Correctly identify the sched_process_exec tracepoint and its format schema.',
  prerequisites: [
    {
      type: 'COURSE',
      targetSlug: 'linux-fundamentals',
      title: 'Linux Fundamentals Course',
      order: 1,
    },
    {
      type: 'COURSE',
      targetSlug: 'ebpf-tracing',
      title: 'eBPF Tracing & Observability Track',
      order: 2,
    },
  ],
  hints: [
    {
      id: 'hint-1',
      order: 1,
      title: 'Tracepoint vs Kprobe stability',
      content:
        'Tracepoints are statically compiled into the Linux kernel and guarantee a stable API across kernel versions, whereas kprobes attach to dynamic symbols that may change or inline.',
    },
    {
      id: 'hint-2',
      order: 2,
      title: 'Tracepoint format path',
      content:
        'All tracepoint fields are defined in `/sys/kernel/debug/tracing/events/<subsystem>/<event>/format`.',
    },
  ],
  sampleSolution: {
    targetTracepoint: 'sched:sched_process_exec',
    formatFile: '/sys/kernel/debug/tracing/events/sched/sched_process_exec/format',
    probeType: 'TRACEPOINT',
  },
};
