/**
 * Lesson Definition: IP Addresses
 * Course: Linux Fundamentals | Module: Networking Basics
 */

export const ipAddressesLesson = {
  id: 'lesson-ip-addresses',
  courseSlug: 'linux-fundamentals',
  moduleSlug: 'networking-basics',
  title: 'IP Addresses',
  slug: 'ip-addresses',
  description:
    'Understand IPv4 and IPv6 addressing, subnets, netmasks, CIDR prefix notation, and how the Linux kernel performs routing table lookups (FIB).',
  difficulty: 'BEGINNER',
  estimatedMinutes: 15,
  prerequisites: [
    'Network Interfaces',
  ],
  objectives: [
    'Understand IPv4 dotted-decimal (32-bit) and IPv6 (128-bit) addressing.',
    'Calculate network boundaries and broadcast addresses using CIDR notation (/24, /16).',
    'Inspect the kernel Forwarding Information Base (FIB) routing table with ip route.',
  ],
  content: `
### IP Addressing and Subnetting

Every device connected to an IP network requires an IP address:
- **IPv4**: 32-bit integer formatted as four octets: \`192.168.1.50\`.
- **IPv6**: 128-bit address formatted in hexadecimal: \`2001:0db8:85a3::8a2e:0370:7334\`.

### CIDR Notation (Classless Inter-Domain Routing)

A subnet mask defines which portion of the IP address represents the **Network ID** versus the **Host ID**:
- **\`/24\`** (\`255.255.255.0\`): 24 network bits, 8 host bits ($$2^8 - 2 = 254$$ usable hosts).
- **\`/16\`** (\`255.255.0.0\`): 16 network bits, 16 host bits ($$2^{16} - 2 = 65,534$$ usable hosts).

### Kernel Routing Table (FIB)

When a packet is outbound, the kernel queries its **Forwarding Information Base (FIB)**:
- Checks for matching local subnets on attached interfaces.
- Falls back to the **default gateway** (\`default via 192.168.1.1 dev eth0\`) for external traffic.
- In modern cloud networking, eBPF programs attached to \`tc\` (traffic control) can bypass the entire kernel routing table lookup using the \`bpf_redirect()\` helper!
  `,
  terminalCommands: [
    {
      title: 'Listing IP Addresses Assigned to Interfaces',
      command: 'ip -4 -br addr',
      output: 'lo               UNKNOWN        127.0.0.1/8\neth0             UP             192.168.1.100/24',
    },
    {
      title: 'Viewing the Kernel IP Routing Table',
      command: 'ip route show',
      output: 'default via 192.168.1.1 dev eth0 proto dhcp src 192.168.1.100 metric 100\n192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.100 metric 100',
    },
  ],
  codeExamples: [
    {
      language: 'bash',
      title: 'Testing Path Routing with ip route get',
      code: `# Ask kernel routing table which interface and gateway would be chosen
ip route get 8.8.8.8`,
    },
  ],
  hints: [
    'The /24 mask means the first 24 bits (3 bytes) identify the network, and the last 8 bits identify the machine.',
  ],
  knowledgeCheck: {
    title: 'IP Addressing Check',
    type: 'multiple-choice',
    prompt: 'How many usable host IP addresses are available in a standard IPv4 /24 subnet?',
    options: ['254', '256', '512', '128'],
    correctAnswer: '254',
    explanation:
      'A /24 subnet has 8 bits for host addresses (2^8 = 256). Two addresses are reserved: all zeroes (.0) for the Network ID and all ones (.255) for the broadcast address, leaving 254 usable host addresses.',
  },
  resources: [
    {
      title: 'ip-route(8) — Linux manual page',
      url: 'https://man7.org/linux/man-pages/man8/ip-route.8.html',
    },
  ],
};

export default ipAddressesLesson;
