/**
 * Mission Definition: Find a Network Interface
 * Category: NETWORKING | Difficulty: BEGINNER
 * Connected Lesson: network-interfaces / basic-linux-networking-tools
 */

export const findANetworkInterfaceMission = {
  id: 'mission-find-a-network-interface',
  slug: 'find-a-network-interface',
  title: 'Find a Network Interface',
  shortDescription:
    'Inspect network devices, MAC addresses, IP allocations, and MTUs across Linux interfaces.',
  description:
    'A newly deployed gateway server cannot communicate with adjacent Kubernetes worker nodes. Inspect the host network interfaces using modern iproute2 tools, verify loopback and physical link operational states, locate assigned CIDR prefixes, and identify MTU mismatches causing packet drop.',
  category: 'NETWORKING',
  difficulty: 'BEGINNER',
  estimatedMinutes: 15,
  points: 100,
  order: 3,
  isPublished: true,
  lessonSlug: 'network-interfaces',
  story: `
Cloud instances and container hosts often attach multiple network interfaces: physical NICs (\`eth0\`, \`enp3s0\`), virtual bridges (\`cni0\`, \`docker0\`), and loopback (\`lo\`).

On host 'edge-gw-01', egress traffic to 10.244.0.0/16 is failing. Your mission is to inspect the network interfaces, determine which interface is administratively UP or DOWN, inspect the IP address assignments, and verify the Maximum Transmission Unit (MTU) size.
  `,
  objectives: [
    {
      id: 'obj-1',
      title: 'List all network interfaces and operational states',
      description: 'Use ip link show or ip -br link to list all devices and their flags.',
      order: 1,
      validationKey: 'INTERFACE_STATES_LISTED',
    },
    {
      id: 'obj-2',
      title: 'Determine IPv4 CIDR allocation for the primary NIC',
      description: 'Inspect ip addr show to identify the assigned IPv4 address and netmask.',
      order: 2,
      validationKey: 'IP_ADDRESS_VERIFIED',
    },
    {
      id: 'obj-3',
      title: 'Inspect MTU configuration',
      description: 'Compare the MTU between the physical interface and virtual bridge interfaces.',
      order: 3,
      validationKey: 'MTU_CHECKED',
    },
  ],
  instructions: `
### Recommended Investigation Steps

1. Run \`ip -br link\` to check the status of each interface (UP, DOWN, LOWER_UP).
2. Check address assignments with \`ip -br addr\`.
3. Check the default gateway and routing table with \`ip route show\`.
4. Identify which interface possesses the MTU mismatch.
  `,
  successCriteria:
    'Verify all interface operational states, identify the primary interface IP, and detect the MTU setting.',
  prerequisites: [
    {
      type: 'COURSE',
      targetSlug: 'linux-fundamentals',
      title: 'Linux Fundamentals Course',
      order: 1,
    },
    {
      type: 'LESSON',
      targetSlug: 'network-interfaces',
      title: 'Lesson: Network Interfaces & Link Layer',
      order: 2,
    },
    {
      type: 'LESSON',
      targetSlug: 'basic-linux-networking-tools',
      title: 'Lesson: Basic Linux Networking Tools',
      order: 3,
    },
  ],
  hints: [
    {
      id: 'hint-1',
      order: 1,
      title: 'Brief interface formatting',
      content:
        'The `ip -br link` command produces concise, table-formatted output showing device names, state (UP/DOWN), and MAC addresses.',
    },
    {
      id: 'hint-2',
      order: 2,
      title: 'Locating MTU',
      content:
        'The MTU specifies the maximum packet size in bytes that the link layer can transmit without fragmentation. Default Ethernet MTU is 1500 bytes.',
    },
  ],
  sampleSolution: {
    targetInterface: 'eth1',
    operationalState: 'DOWN',
    mtuValue: '1420',
    primaryIp: '192.168.10.50/24',
  },
};
