/**
 * Lesson Definition: Basic Linux Networking Tools
 * Course: Linux Fundamentals | Module: Networking Basics
 */

export const basicLinuxNetworkingToolsLesson = {
  id: 'lesson-basic-linux-networking-tools',
  courseSlug: 'linux-fundamentals',
  moduleSlug: 'networking-basics',
  title: 'Basic Linux Networking Tools',
  slug: 'basic-linux-networking-tools',
  description:
    'Master the modern Linux networking toolchain: ip, ss, ping, curl, traceroute, and tcpdump, and contrast user-space socket utilities with low-level kernel tracing.',
  difficulty: 'INTERMEDIATE',
  estimatedMinutes: 20,
  prerequisites: [
    'Network Interfaces and Link Layer',
    'IP Addresses and Subnetting',
    'TCP and UDP',
  ],
  objectives: [
    'Replace legacy net-tools (ifconfig, netstat, route) with modern iproute2 utilities (ip, ss).',
    'Diagnose end-to-end IP reachability and latency with ping and traceroute.',
    'Inspect active kernel socket states, buffer queues, and owning process PIDs with ss.',
    'Capture and filter live network packets using tcpdump and libpcap / eBPF filters.',
    'Perform HTTP/REST endpoint diagnostics using curl with header inspection.',
  ],
  content: `
### The Modern Linux Networking Toolchain

For decades, sysadmins relied on the \`net-tools\` suite (\`ifconfig\`, \`netstat\`, \`arp\`, \`route\`). These legacy utilities read directly from \`/proc/net\` text files, which scales poorly when handling thousands of interfaces or tens of thousands of active socket connections.

Modern Linux uses the **iproute2** suite, which communicates directly with the kernel networking subsystem using the high-performance binary **Netlink protocol** (\`AF_NETLINK\` sockets).

| Legacy Utility | Modern Replacement | Subsystem / Protocol |
| :--- | :--- | :--- |
| \`ifconfig\` | \`ip link\`, \`ip addr\` | Netlink (\`RTM_GETLINK\`, \`RTM_GETADDR\`) |
| \`route\` | \`ip route\` | Netlink routing table (\`RTM_GETROUTE\`) |
| \`arp\` | \`ip neigh\` | Kernel Neighbor Table (ARP / NDP) |
| \`netstat\` | \`ss\` | Netlink INET_DIAG (\`sock_diag\`) |

---

### Key Utilities in Practice

#### 1. \`ip\` (The Swiss Army Knife of Linux Networking)
The \`ip\` command interacts with links, IP addresses, routing policies, and network namespaces:
- \`ip -br link\`: Brief listing of interface operational states (UP, DOWN, LOWER_UP).
- \`ip -br addr\`: Compact overview of assigned IPv4 and IPv6 CIDRs.
- \`ip route show\`: Displays the kernel FIB (Forwarding Information Base).

#### 2. \`ss\` (Socket Statistics)
\`ss\` dumps socket metrics straight from the kernel's \`inet_diag\` netlink module:
- \`ss -tulpn\`:
  - \`-t\`: TCP sockets
  - \`-u\`: UDP sockets
  - \`-l\`: Listening sockets only
  - \`-p\`: Show process name and PID owning the file descriptor
  - \`-n\`: Numeric output (do not resolve IP/port names via DNS)

#### 3. \`ping\` (ICMP Echo Request/Reply)
Sends ICMP \`ECHO_REQUEST\` (Type 8) to verify Layer 3 reachability and measure Round-Trip Time (RTT). Note that firewalls often drop ICMP packets even if TCP application ports are open.

#### 4. \`tcpdump\` (Packet Sniffer)
\`tcpdump\` uses \`libpcap\` to capture raw packets passing through network interfaces. Under the hood, \`tcpdump\` compiles user filter expressions (like \`port 80\`) into classic BPF (cBPF) bytecode, which the Linux kernel verifies and executes on every incoming packet inside Ring 0 before copying matching packets to user space!

---

### Transitioning to eBPF Observability

While \`tcpdump\` and \`ss\` are essential everyday tools, they still introduce packet-copying overhead or snapshot latency. Modern eBPF tools (such as \`bpftrace\`, \`tcprtt\`, and \`bpfdoor\`) hook directly into kernel tracepoints (\`sock:inet_sock_set_state\`, \`net:netif_receive_skb\`), calculating histograms and metrics entirely within kernel space with zero packet copy to user space.
  `,
  terminalCommands: [
    {
      title: 'Listing Interfaces in Brief Format',
      command: 'ip -br addr',
      output: `lo               UNKNOWN        127.0.0.1/8 ::1/128 
eth0             UP             192.168.1.105/24 fe80::215:5dff:fe1a:8b22/64
docker0          DOWN           172.17.0.1/16`,
    },
    {
      title: 'Inspecting Listening Services with Process PIDs',
      command: 'ss -tulpn',
      output: `Netid  State   Recv-Q  Send-Q  Local Address:Port   Peer Address:Port  Process
tcp    LISTEN  0       128           0.0.0.0:22            0.0.0.0:*      users:(("sshd",pid=842,fd=3))
tcp    LISTEN  0       511         127.0.0.1:3000          0.0.0.0:*      users:(("node",pid=4210,fd=18))`,
    },
    {
      title: 'Tracing End-to-End Routing Hops',
      command: 'traceroute -n 1.1.1.1',
      output: `traceroute to 1.1.1.1 (1.1.1.1), 30 hops max, 60 byte packets
 1  192.168.1.1  1.821 ms  1.712 ms  1.690 ms
 2  10.120.0.1   9.412 ms  8.922 ms  9.011 ms
 3  1.1.1.1      14.210 ms 13.980 ms 13.850 ms`,
    },
  ],
  codeExamples: [
    {
      title: 'Filtering HTTP Traffic with tcpdump (cBPF Expression)',
      language: 'bash',
      code: `# Capture only TCP SYN packets destined for port 80 or 443
sudo tcpdump -i eth0 -nn "tcp[tcpflags] & (tcp-syn) != 0 and (port 80 or port 443)"

# Capture 5 DNS queries on port 53 and print in hex/ASCII
sudo tcpdump -i eth0 -c 5 -nn -X udp port 53`,
    },
  ],
  hints: [
    'Always use numeric mode (-n) with ss and tcpdump in production to avoid hanging on slow DNS reverse lookups.',
    'Remember: modern Linux tools use Netlink binary sockets rather than parsing /proc/net text files.',
  ],
  knowledgeCheck: {
    title: 'Modern Linux Networking Tooling',
    type: 'multiple-choice',
    prompt:
      'Why is "ss" dramatically faster and more efficient than the legacy "netstat" command when inspecting systems with tens of thousands of active network sockets?',
    options: [
      'ss compiles socket requests into eBPF XDP programs executed on the physical network card.',
      'ss queries the kernel via the binary Netlink sock_diag interface instead of reading and string-parsing large text files under /proc/net/.',
      'ss only queries UDP sockets, ignoring heavier TCP connection tables.',
      'ss runs as an unprivileged user process that bypasses kernel system calls completely.',
    ],
    correctAnswer: 1,
    explanation:
      'The modern ss utility communicates with the kernel using the binary Netlink sock_diag interface, allowing the kernel to serialize and filter socket state in memory without the massive overhead of generating and parsing large text buffers in /proc/net/tcp.',
  },
  resources: [
    {
      title: 'iproute2 - Linux Foundation Networking',
      url: 'https://wiki.linuxfoundation.org/networking/iproute2',
    },
    {
      title: 'ss(8) - Linux Man Page',
      url: 'https://man7.org/linux/man-pages/man8/ss.8.html',
    },
    {
      title: 'tcpdump & BPF Syntax Guide',
      url: 'https://www.tcpdump.org/manpages/pcap-filter.7.html',
    },
  ],
};
