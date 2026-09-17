/**
 * Playground Example: Count Events With a Map
 * Category: Maps | Language: c
 */

export const countEventsExample = {
  id: 'example-count-events',
  slug: 'count-events',
  title: 'Count Events With a Map',
  shortDescription: 'Maintain a BPF hash map in kernel space to aggregate syscall frequencies by PID.',
  category: 'Maps',
  difficulty: 'INTERMEDIATE',
  language: 'c',
  order: 4,
  prerequisites: ['eBPF Fundamentals', 'Understanding of Hash Maps'],
  explanation: `
### How It Works

This example introduces BPF Maps—the primary mechanism for persisting data in the kernel and sharing it with user-space applications:

1. **\`SEC(".maps") struct bpf_map_def\`**: Declares a persistent key-value store of type \`BPF_MAP_TYPE_HASH\`. The key is a 32-bit PID (\`__u32\`), and the value is a 64-bit event counter (\`__u64\`).
2. **\`bpf_map_lookup_elem()\`**: Checks if a counter already exists for this process.
3. **\`bpf_map_update_elem()\`**: Atomically creates or updates the frequency count in kernel memory without having to send every individual packet or syscall to user space.
  `,
  starterSource: `// BPFQuest — Count Events With a BPF Map
// Aggregates syscall frequencies in a kernel hash map

#include "vmlinux.h"
#include <bpf/bpf_helpers.h>

// BPF Map definition for PID -> Call Count
struct {
    __uint(type, BPF_MAP_TYPE_HASH);
    __uint(max_entries, 1024);
    __type(key, u32);
    __type(value, u64);
} exec_counts SEC(".maps");

SEC("tracepoint/syscalls/sys_enter_write")
int count_writes(struct trace_event_raw_sys_enter *ctx)
{
    u32 pid = bpf_get_current_pid_tgid() >> 32;

    u64 *count = bpf_map_lookup_elem(&exec_counts, &pid);
    if (count) {
        // Increment existing count
        __sync_fetch_and_add(count, 1);
    } else {
        // First occurrence for this PID
        u64 initial_count = 1;
        bpf_map_update_elem(&exec_counts, &pid, &initial_count, BPF_ANY);
    }

    return 0;
}

char LICENSE[] SEC("license") = "Dual BSD/GPL";
`,
  sampleOutput: `STATUS: SIMULATED ENVIRONMENT (Stage 7 MicroVM Lab Runner Coming Soon)

$ bpfquest compile count_events.bpf.c
$ bpfquest load-map exec_counts
$ bpfquest map-dump exec_counts

[Example Output - Not live kernel execution]
KEY (PID)       VALUE (COUNT)
1820            482 writes
2411            15 writes
4092            8912 writes
`,
};
