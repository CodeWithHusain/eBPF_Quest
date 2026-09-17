/**
 * Mission Definition: First eBPF Program
 * Category: EBPF | Difficulty: INTERMEDIATE
 * Connected Course: eBPF Fundamentals
 */

export const firstEbpfProgramMission = {
  id: 'mission-first-ebpf-program',
  slug: 'first-ebpf-program',
  title: 'First eBPF Program',
  shortDescription:
    'Deconstruct the essential anatomy of a modern C eBPF program: hooks, SEC() annotations, BPF maps, and verifier safety.',
  description:
    'Write and structure the skeleton of an in-kernel eBPF program targeting raw system call entry. Understand the role of ELF section headers, helper functions, BPF map data structures for kernel-to-userspace communication, and the strict safety checks enforced by the in-kernel bytecode verifier.',
  category: 'EBPF',
  difficulty: 'INTERMEDIATE',
  estimatedMinutes: 30,
  points: 200,
  order: 5,
  isPublished: true,
  lessonSlug: null,
  story: `
eBPF allows user-space developers to inject safe bytecode into the Linux kernel without recompiling the operating system or loading dangerous kernel modules.

In this mission, you will step into the shoes of an infrastructure engineer architecting a zero-overhead monitoring sensor. You will define an eBPF program with appropriate \`SEC("tracepoint/syscalls/sys_enter_openat")\` directives, declare a BPF Hash Map (\`BPF_MAP_TYPE_HASH\`) to store file opening frequencies by PID, and ensure memory accesses satisfy the kernel verifier.
  `,
  objectives: [
    {
      id: 'obj-1',
      title: 'Define ELF section header for the tracepoint hook',
      description: 'Use the correct SEC macro to instruct libbpf where to attach the bytecode.',
      order: 1,
      validationKey: 'SEC_DIRECTIVE_DEFINED',
    },
    {
      id: 'obj-2',
      title: 'Declare a BPF Hash Map for tracking metrics',
      description: 'Define struct bpf_map_def or modern BTF-defined map with key and value types.',
      order: 2,
      validationKey: 'BPF_MAP_DECLARED',
    },
    {
      id: 'obj-3',
      title: 'Satisfy verifier safety requirements',
      description: 'Ensure bounded memory access and valid pointer dereferencing before returning 0.',
      order: 3,
      validationKey: 'VERIFIER_SAFETY_CONFIRMED',
    },
  ],
  instructions: `
### Recommended Investigation Steps

1. Review the structure of modern libbpf C programs using \`vmlinux.h\` and \`bpf/bpf_helpers.h\`.
2. Annotate your function with \`SEC("tracepoint/syscalls/sys_enter_openat")\`.
3. Declare a map with type \`BPF_MAP_TYPE_HASH\`, key \`__u32\` (PID), and value \`__u64\` (count).
4. Formulate the program logic using \`bpf_map_lookup_elem\` and \`bpf_map_update_elem\`.
5. Submit your structural solution in the Mission Workspace.
  `,
  successCriteria:
    'Specify the valid SEC annotation, BPF hash map declaration, and return code convention.',
  prerequisites: [
    {
      type: 'COURSE',
      targetSlug: 'linux-fundamentals',
      title: 'Linux Fundamentals Course',
      order: 1,
    },
    {
      type: 'COURSE',
      targetSlug: 'ebpf-fundamentals',
      title: 'eBPF Fundamentals Track',
      order: 2,
    },
  ],
  hints: [
    {
      id: 'hint-1',
      order: 1,
      title: 'The SEC macro in libbpf',
      content:
        'The `SEC()` macro places the compiled bytecode into a specific ELF section (e.g. `SEC("tracepoint/...")`), which tells libbpf the program type and attachment target.',
    },
    {
      id: 'hint-2',
      order: 2,
      title: 'Return codes for tracepoints',
      content:
        'Tracepoint and kprobe eBPF programs typically return 0. Returning non-zero in network filters (like XDP or TC) acts as an action code (e.g. XDP_PASS or XDP_DROP).',
    },
  ],
  sampleSolution: {
    sectionHeader: 'SEC("tracepoint/syscalls/sys_enter_openat")',
    mapType: 'BPF_MAP_TYPE_HASH',
    returnCode: '0',
  },
};
