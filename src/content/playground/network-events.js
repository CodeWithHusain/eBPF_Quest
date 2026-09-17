/**
 * Playground Example: Network Event Observation
 * Category: Networking | Language: c
 */

export const networkEventsExample = {
  id: 'example-network-events',
  slug: 'network-events',
  title: 'Network Event Observation',
  shortDescription: 'Inspect socket connect events and extract destination IP addresses and ports.',
  category: 'Networking',
  difficulty: 'INTERMEDIATE',
  language: 'c',
  order: 5,
  prerequisites: ['Linux Networking: TCP and UDP', 'Lesson: Ports & Sockets'],
  explanation: `
### How It Works

This program monitors network connections made by local processes:

1. **\`SEC("tracepoint/syscalls/sys_enter_connect")\`**: Triggers whenever an application initiates an outgoing TCP/UDP socket connection via \`connect(2)\`.
2. **\`struct sockaddr_in\`**: The C representation of an IPv4 socket address containing destination port and IP address.
3. **\`bpf_probe_read_user()\`**: Safely copies the socket address structure from user space into kernel registers to parse the destination IP and port.
  `,
  starterSource: `// BPFQuest — Network Event Observation
// Hooks sys_enter_connect to observe outgoing socket connections

#include "vmlinux.h"
#include <bpf/bpf_helpers.h>
#include <bpf/bpf_endian.h>

SEC("tracepoint/syscalls/sys_enter_connect")
int handle_connect(struct trace_event_raw_sys_enter *ctx)
{
    u32 pid = bpf_get_current_pid_tgid() >> 32;

    // Arg 0: socket file descriptor
    // Arg 1: struct sockaddr *
    struct sockaddr_in user_addr;
    const void *addr_ptr = (const void *)ctx->args[1];

    if (bpf_probe_read_user(&user_addr, sizeof(user_addr), addr_ptr) == 0) {
        if (user_addr.sin_family == 2) { // AF_INET = 2
            u16 port = bpf_ntohs(user_addr.sin_port);
            bpf_printk("OUTGOING CONNECT -> PID: %d, TARGET PORT: %d\\n", pid, port);
        }
    }

    return 0;
}

char LICENSE[] SEC("license") = "Dual BSD/GPL";
`,
  sampleOutput: `STATUS: SIMULATED ENVIRONMENT (Stage 7 MicroVM Lab Runner Coming Soon)

$ bpfquest compile network_events.bpf.c
$ bpfquest attach syscalls:sys_enter_connect

[Example Output - Not live kernel execution]
PID     COMM            DEST_IP         PORT    PROTOCOL
4210    curl            140.82.121.4    443     TCP/HTTPS
3102    node            127.0.0.1       5432    TCP/PostgreSQL
5514    dnsmasq         1.1.1.1         53      UDP/DNS
`,
};
