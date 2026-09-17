/**
 * Lesson Definition: Network Interfaces
 * Course: Linux Fundamentals | Module: Networking Basics
 */

export const networkInterfacesLesson = {
  id: 'lesson-network-interfaces',
  courseSlug: 'linux-fundamentals',
  moduleSlug: 'networking-basics',
  title: 'Network Interfaces',
  slug: 'network-interfaces',
  description:
    'Examine Linux network devices: loopback (lo), physical interfaces (eth0), virtual Ethernet pairs (veth), MTU, and the sk_buff socket buffer data structure.',
  difficulty: 'BEGINNER',
  estimatedMinutes: 18,
  prerequisites: [
    'Permissions module',
  ],
  objectives: [
    'Inspect physical and virtual network interfaces using ip link and ip addr.',
    'Understand virtual Ethernet pairs (veth) bridging container network namespaces.',
    'Explore sk_buff (socket buffer) and where XDP bare-metal packet processing hooks in.',
  ],
  content: `
### How the Linux Kernel Sees Network Interfaces

In Linux, network interfaces are **not represented as files in /dev/** (you cannot \`open("/dev/eth0")\`). Instead, they are represented in kernel memory as **\`struct net_device\`** objects:

- **Loopback (\`lo\`)**: In-memory interface (127.0.0.1) that routes traffic entirely within kernel RAM without touching physical network hardware.
- **Physical Ethernet / WiFi (\`eth0\`, \`enp3s0\`, \`wlan0\`)**: Bound to hardware PCI device drivers.
- **Virtual Ethernet (\`veth\`)**: Created in interconnected pairs—packets sent into \`veth0\` emerge immediately out of \`veth1\`. This is the fundamental mechanism connecting Docker/Kubernetes container network namespaces to the host bridge!

### The Packet Lifecycle: sk_buff vs XDP

When a network card receives an Ethernet frame:
1. **Traditional Path**:
   - The NIC driver allocates a complex kernel data structure: **\`struct sk_buff\`** (socket buffer).
   - The kernel parses MAC headers, IP headers, handles TCP checksums, and dispatches to socket receive queues.
   - This carries high CPU overhead for high-packet-rate (10M+ pps) DDoS mitigation!
2. **XDP (eXpress Data Path)**:
   - **Runs eBPF bytecode directly inside the NIC driver BEFORE the \`sk_buff\` is ever allocated!**
   - Packets can be inspected and dropped (\`XDP_DROP\`) or redirected (\`XDP_TX\`) at bare-metal line rate.
  `,
  terminalCommands: [
    {
      title: 'Listing Network Interfaces and Link States',
      command: 'ip -br link',
      output: 'lo               UNKNOWN        00:00:00:00:00:00 <LOOPBACK,UP,LOWER_UP>\neth0             UP             52:54:00:12:34:56 <BROADCAST,MULTICAST,UP,LOWER_UP>',
    },
    {
      title: 'Inspecting MTU and MAC Address',
      command: 'ip link show eth0',
      output: '2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP mode DEFAULT group default qlen 1000\n    link/ether 52:54:00:12:34:56 brd ff:ff:ff:ff:ff:ff',
    },
  ],
  codeExamples: [
    {
      language: 'c',
      title: 'Minimal XDP eBPF Packet Drop Program',
      code: `// Ultra-fast bare-metal packet filtering before sk_buff allocation
#include <linux/bpf.h>
#include <bpf/bpf_helpers.h>

SEC("xdp")
int drop_all_packets(struct xdp_md *ctx) {
    // Drop the frame directly at the network card driver
    return XDP_DROP;
}

char _license[] SEC("license") = "GPL";`,
    },
  ],
  hints: [
    'XDP hooks directly inside the network driver before Linux allocates an sk_buff, enabling 10x-50x faster packet processing than iptables.',
  ],
  knowledgeCheck: {
    title: 'Network Interfaces & XDP Check',
    type: 'multiple-choice',
    prompt: 'At what point in packet reception does eBPF XDP (eXpress Data Path) execute?',
    options: [
      'Directly in the NIC driver before the kernel allocates an sk_buff',
      'After the packet has passed through iptables filter chains',
      'Inside userspace socket buffers',
      'At the TCP reassembly layer',
    ],
    correctAnswer: 'Directly in the NIC driver before the kernel allocates an sk_buff',
    explanation:
      'XDP executes verified eBPF bytecode at the lowest possible layer of the network subsystem—inside the network device driver before sk_buff allocation and IP stack traversal.',
  },
  resources: [
    {
      title: 'ip-link(8) — Linux manual page',
      url: 'https://man7.org/linux/man-pages/man8/ip-link.8.html',
    },
    {
      title: 'XDP (eXpress Data Path) Tutorial',
      url: 'https://github.com/xdp-project/xdp-tutorial',
    },
  ],
};

export default networkInterfacesLesson;
