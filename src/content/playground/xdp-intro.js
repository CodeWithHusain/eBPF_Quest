/**
 * Playground Example: XDP Introduction
 * Category: Networking | Language: c
 */

export const xdpIntroExample = {
  id: 'example-xdp-intro',
  slug: 'xdp-intro',
  title: 'XDP Introduction',
  shortDescription: 'Bare-metal wire speed packet filtering directly at the NIC driver layer.',
  category: 'Networking',
  difficulty: 'ADVANCED',
  language: 'c',
  order: 6,
  prerequisites: ['eXpress Data Path (XDP)', 'Ethernet & IP Packet Framing'],
  explanation: `
### How It Works

XDP (eXpress Data Path) executes eBPF bytecode at the lowest possible layer of the Linux networking subsystem—directly inside the physical NIC driver before the kernel allocates an \`sk_buff\` socket buffer structure.

1. **\`SEC("xdp")\`**: Targets the XDP packet ingestion hook.
2. **\`struct xdp_md *ctx\`**: Provides \`data\` and \`data_end\` pointers directly referencing raw wire frame memory.
3. **Boundary Checking**: The in-kernel verifier strictly requires packet pointer arithmetic to prove accesses remain within \`[data, data_end]\` before dereferencing headers.
4. **\`XDP_DROP\` vs \`XDP_PASS\`**: Returning \`XDP_DROP\` instantly dumps malicious DDoS packets at tens of millions of packets per second with virtually zero CPU utilization.
  `,
  starterSource: `// BPFQuest — XDP Introduction
// Wire-speed packet filter dropping UDP port 1337 traffic

#include "vmlinux.h"
#include <bpf/bpf_helpers.h>
#include <bpf/bpf_endian.h>

#define ETH_P_IP 0x0800
#define IPPROTO_UDP 17

SEC("xdp")
int filter_packet(struct xdp_md *ctx)
{
    void *data_end = (void *)(long)ctx->data_end;
    void *data = (void *)(long)ctx->data;

    // Boundary check for Ethernet header
    struct ethhdr *eth = data;
    if ((void *)(eth + 1) > data_end)
        return XDP_PASS;

    // Only inspect IPv4
    if (bpf_ntohs(eth->h_proto) != ETH_P_IP)
        return XDP_PASS;

    // Boundary check for IPv4 header
    struct iphdr *ip = (void *)(eth + 1);
    if ((void *)(ip + 1) > data_end)
        return XDP_PASS;

    // Check if UDP protocol
    if (ip->protocol == IPPROTO_UDP) {
        struct udphdr *udp = (void *)(ip + 1);
        if ((void *)(udp + 1) > data_end)
            return XDP_PASS;

        // Drop packets targeted at port 1337
        if (bpf_ntohs(udp->dest) == 1337) {
            bpf_printk("XDP: Dropped UDP flood packet on port 1337\\n");
            return XDP_DROP; // Wire-speed packet drop
        }
    }

    return XDP_PASS; // Normal stack delivery
}

char LICENSE[] SEC("license") = "Dual BSD/GPL";
`,
  sampleOutput: `STATUS: SIMULATED ENVIRONMENT (Stage 7 MicroVM Lab Runner Coming Soon)

$ bpfquest compile xdp_intro.bpf.c
$ bpfquest xdp-attach eth0 xdp_intro.bpf.o

[Example Output - Not live kernel execution]
INTERFACE   STATUS      PACKETS/SEC     ACTION
eth0        ATTACHED    1,420,000 pps   XDP_PASS
eth0        FILTERING   85,000 pps      XDP_DROP (Port 1337)
`,
};
