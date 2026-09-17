/**
 * Lesson Definition: Ports
 * Course: Linux Fundamentals | Module: Networking Basics
 */

export const portsLesson = {
  id: 'lesson-ports',
  courseSlug: 'linux-fundamentals',
  moduleSlug: 'networking-basics',
  title: 'Ports',
  slug: 'ports',
  description:
    'Demystify transport layer port numbers (0-65535), privileged ports (<1024), ephemeral client ports, and socket 5-tuples in the Linux network stack.',
  difficulty: 'BEGINNER',
  estimatedMinutes: 15,
  prerequisites: [
    'IP Addresses',
  ],
  objectives: [
    'Understand port ranges: Privileged/Well-known (0-1023), Registered (1024-49151), and Ephemeral (49152-65535).',
    'Define a socket 5-tuple: (Source IP, Source Port, Dest IP, Dest Port, Protocol).',
    'Understand why unprivileged users cannot bind to ports below 1024 without CAP_NET_BIND_SERVICE.',
  ],
  content: `
### What is a Port?

While an IP address directs packets to a specific machine on a network, a **Port number** (a 16-bit integer from 0 to 65535) directs packets to a specific socket or application process on that machine.

### Port Classifications

1. **Well-Known / Privileged Ports (0 – 1023)**:
   - Reserved for standard core services: HTTP (80), HTTPS (443), SSH (22), DNS (53).
   - In Linux, binding to ports below 1024 requires either UID 0 (root) or the **\`CAP_NET_BIND_SERVICE\`** capability.
2. **Registered Ports (1024 – 49151)**:
   - Assigned by IANA for specific services (e.g. MySQL 3306, PostgreSQL 5432, Redis 6379).
3. **Dynamic / Ephemeral Ports (49152 – 65535)**:
   - Temporarily allocated by the kernel network stack when a client program initiates an outbound connection.

### The Socket 5-Tuple

In the Linux kernel TCP/IP stack, every connection is uniquely identified by a **5-tuple**:
\`\`\`text
( Source IP, Source Port, Destination IP, Destination Port, Protocol )
\`\`\`
Two different client connections can connect to port 443 simultaneously because their source IP or source port differs!
  `,
  terminalCommands: [
    {
      title: 'Viewing Ephemeral Port Range Configured in Kernel',
      command: 'cat /proc/sys/net/ipv4/ip_local_port_range',
      output: '32768   60999',
    },
    {
      title: 'Listing Listening TCP Ports with ss',
      command: 'ss -tln',
      output: 'State   Recv-Q  Send-Q   Local Address:Port   Peer Address:Port\nLISTEN  0       128            0.0.0.0:22          0.0.0.0:*\nLISTEN  0       511            0.0.0.0:80          0.0.0.0:*',
    },
  ],
  codeExamples: [
    {
      language: 'bash',
      title: 'Granting Non-Root Port 80/443 Binding with setcap',
      code: `# Allow node to bind to port 80 without root
sudo setcap 'cap_net_bind_service=+ep' /usr/bin/node`,
    },
  ],
  hints: [
    'Privileged ports are below 1024. CAP_NET_BIND_SERVICE allows non-root web servers to bind to 80/443.',
  ],
  knowledgeCheck: {
    title: 'Ports Check',
    type: 'multiple-choice',
    prompt: 'What capability or privilege is required in Linux to bind a server socket to a privileged port below 1024 (e.g. port 80)?',
    options: [
      'UID 0 (root) or the CAP_NET_BIND_SERVICE capability',
      'Membership in the dialout user group',
      'The CAP_SYS_PTRACE capability',
      'Read access to /etc/shadow',
    ],
    correctAnswer: 'UID 0 (root) or the CAP_NET_BIND_SERVICE capability',
    explanation:
      'In Linux, binding to ports below 1024 is privileged. It requires either root execution (UID 0) or the granular CAP_NET_BIND_SERVICE capability granted to the binary or thread.',
  },
  resources: [
    {
      title: 'services(5) — Linux manual page',
      url: 'https://man7.org/linux/man-pages/man5/services.5.html',
    },
    {
      title: 'bind(2) — Linux manual page',
      url: 'https://man7.org/linux/man-pages/man2/bind.2.html',
    },
  ],
};

export default portsLesson;
