/**
 * Lesson Definition: TCP and UDP
 * Course: Linux Fundamentals | Module: Networking Basics
 */

export const tcpAndUdpLesson = {
  id: 'lesson-tcp-and-udp',
  courseSlug: 'linux-fundamentals',
  moduleSlug: 'networking-basics',
  title: 'TCP and UDP',
  slug: 'tcp-and-udp',
  description:
    'Deep dive into the core Layer 4 transport protocols in Linux: reliable byte streams and connection state machines in TCP vs stateless datagram delivery in UDP, and how Linux manages socket buffers.',
  difficulty: 'INTERMEDIATE',
  estimatedMinutes: 25,
  prerequisites: [
    'IP Addresses and Subnetting',
    'Ports and Socket Addressing',
    'Basic understanding of network packets',
  ],
  objectives: [
    'Distinguish between connection-oriented stream semantics (TCP) and message-oriented datagrams (UDP).',
    'Trace the TCP 3-way handshake (SYN, SYN-ACK, ACK) and 4-way termination (FIN-ACK).',
    'Understand the TCP socket state machine (LISTEN, SYN_SENT, ESTABLISHED, TIME_WAIT, CLOSE_WAIT).',
    'Inspect socket receive and transmit buffers (sk_buff / sk_wmem / sk_rmem) in Linux.',
    'Understand how eBPF sockops and sock_msg programs hook TCP state transitions.',
  ],
  content: `
### Transport Layer (Layer 4) in the Linux Kernel

The Transport Layer delivers data between application processes across networks. While IP delivers packets best-effort between host machines, Layer 4 protocols provide process-level addressing (via port numbers) and optional reliability, sequencing, and congestion control guarantees.

In Linux, the two primary transport protocols are:

1. **TCP (Transmission Control Protocol - RFC 793 / RFC 9293)**:
   - **Connection-oriented**: Requires explicit connection establishment before data exchange.
   - **Reliable byte-stream**: Guarantees in-order, error-checked, duplicate-free delivery using sequence numbers and ACKs.
   - **Flow & Congestion Control**: Dynamically throttles transmit rate to match receiver capacity (sliding window) and network congestion (BBR, CUBIC).
   - **Kernel Overhead**: Higher memory footprint per connection due to TCP Control Blocks (\`struct tcp_sock\`), retransmission queues, and timer wheels.

2. **UDP (User Datagram Protocol - RFC 768)**:
   - **Connectionless**: Applications immediately send discrete datagrams without setup negotiation.
   - **Unreliable / Best-Effort**: Packets may arrive out of order, get duplicated, or drop completely without automatic retransmission.
   - **Message-boundary preserving**: Each \`sendto(2)\` maps directly to a discrete packet; receivers read exact message boundaries via \`recvfrom(2)\`.
   - **Low Latency & Minimal State**: Negligible kernel state per socket; ideal for real-time audio/video, DNS queries, and gaming telemetry.

---

### The TCP Three-Way Handshake

To establish synchronization and negotiate Initial Sequence Numbers (ISNs) and options (like Maximum Segment Size, Window Scaling, and Selective ACK / SACK), TCP executes a three-way handshake:

\`\`\`text
Client (User Process)                 Server (Kernel TCP Stack)
      |                                        |
      | --- SYN (seq=x) ---------------------> | [Server transitions to SYN_RECV]
      |                                        |   Allocates SYN queue entry
      |                                        |
      | <--- SYN-ACK (seq=y, ack=x+1) -------- |
      |                                        |
[Client ESTABLISHED]                           |
      | --- ACK (ack=y+1) -------------------> | [Server transitions to ESTABLISHED]
      |                                        |   Moves socket to Accept Queue
      |                                        |
\`\`\`

When the final ACK arrives, the kernel places the completed connection into the socket's **Accept Queue**. The user-space server process retrieves it by calling \`accept(2)\`, which returns a brand-new file descriptor specifically dedicated to that client session.

---

### TCP Socket State Machine

During its lifecycle, a TCP socket transitions through distinct kernel states:

- **LISTEN**: Server socket waiting for incoming SYN requests.
- **SYN_SENT**: Client initiated handshake; waiting for SYN-ACK.
- **SYN_RECV**: Server received SYN; waiting for final client ACK.
- **ESTABLISHED**: Active bidirectional data transfer phase.
- **FIN_WAIT_1 / FIN_WAIT_2**: Socket has initiated active close and is waiting for remote peer termination.
- **CLOSE_WAIT**: Remote peer initiated close; waiting for local application to call \`close(fd)\`.
- **TIME_WAIT**: Connection is closed, but the kernel retains the 4-tuple record (default: 60 seconds) to catch delayed duplicate packets that might otherwise corrupt a subsequent connection with the same port numbers.

---

### eBPF at Layer 4: Sockops and TC

Traditional socket tracing relied on intercepting libc calls or reading \`/proc/net/tcp\`. With modern Linux and eBPF:

- **BPF_PROG_TYPE_SOCK_OPS**: Fires callbacks on TCP state changes (e.g. \`BPF_SOCK_OPS_ACTIVE_ESTABLISHED_CB\`, \`BPF_SOCK_OPS_RTT_CB\`), allowing real-time TCP tuning and latency measurements without user-space round trips.
- **Sockmap & \`bpf_msg_redirect_hash\`**: Enables kernel-level socket redirection, bypassing the TCP/IP stack entirely for co-located processes (e.g., Envoy sidecar to application container) with zero-copy speeds.
  `,
  terminalCommands: [
    {
      title: 'Listing Active TCP Connections and States',
      command: 'ss -tan',
      output: `State      Recv-Q Send-Q  Local Address:Port   Peer Address:Port
LISTEN     0      128           0.0.0.0:22          0.0.0.0:*
LISTEN     0      511         127.0.0.1:3000        0.0.0.0:*
ESTAB      0      0       192.168.1.105:44322   140.82.121.4:443
TIME_WAIT  0      0       192.168.1.105:51234   172.217.16.206:443`,
    },
    {
      title: 'Viewing UDP Socket Listeners',
      command: 'ss -uan',
      output: `State   Recv-Q Send-Q Local Address:Port  Peer Address:Port
UNCONN  0      0            0.0.0.0:5353        0.0.0.0:*
UNCONN  0      0            0.0.0.0:68          0.0.0.0:*`,
    },
    {
      title: 'Inspecting System TCP Socket Memory Allocations',
      command: 'cat /proc/net/sockstat',
      output: `sockets: used 214
TCP: inuse 8 orphan 0 tw 1 alloc 12 mem 2
UDP: inuse 4 mem 1
RAW: inuse 0
FRAG: inuse 0 memory 0`,
    },
  ],
  codeExamples: [
    {
      title: 'C TCP Socket Connection Flow (POSIX)',
      language: 'c',
      code: `// Minimal TCP Client socket flow
int sockfd = socket(AF_INET, SOCK_STREAM, 0); // SOCK_STREAM = TCP

struct sockaddr_in serv_addr;
memset(&serv_addr, 0, sizeof(serv_addr));
serv_addr.sin_family = AF_INET;
serv_addr.sin_port = htons(8080);
inet_pton(AF_INET, "127.0.0.1", &serv_addr.sin_addr);

// Initiates 3-way handshake (SYN)
connect(sockfd, (struct sockaddr *)&serv_addr, sizeof(serv_addr));

char msg[] = "GET / HTTP/1.1\\r\\nHost: localhost\\r\\n\\r\\n";
send(sockfd, msg, strlen(msg), 0);

char buffer[1024];
ssize_t bytes = recv(sockfd, buffer, sizeof(buffer) - 1, 0);
close(sockfd);`,
    },
  ],
  hints: [
    'Notice that TCP uses SOCK_STREAM (continuous ordered bytes) while UDP uses SOCK_DGRAM (discrete packets).',
    'A high number of TIME_WAIT sockets is normal on high-traffic web servers; the kernel maintains this state to absorb rogue lingering packets.',
  ],
  knowledgeCheck: {
    title: 'TCP Connection States and Semantics',
    type: 'multiple-choice',
    prompt:
      'What is the primary reason the Linux kernel holds a closed TCP connection in the TIME_WAIT state for approximately 60 seconds (2 * MSL)?',
    options: [
      'To finish transmitting files that were buffered in user-space disk memory.',
      'To prevent delayed duplicate packets from a previous connection from corrupting data in a newly opened connection reusing the same 4-tuple.',
      'To allow the remote host to renegotiate the TLS cryptographic cipher suite.',
      'To recharge the kernel socket buffer allocator before freeing the file descriptor.',
    ],
    correctAnswer: 1,
    explanation:
      'The TIME_WAIT state exists to ensure late-arriving or delayed duplicate packets from the old connection do not get accepted as valid data by a newly spawned socket that happens to reuse the identical (Source IP, Source Port, Dest IP, Dest Port) 4-tuple, and to allow the remote end to retransmit FIN if its final ACK was lost.',
  },
  resources: [
    {
      title: 'RFC 9293 - Transmission Control Protocol (TCP)',
      url: 'https://datatracker.ietf.org/doc/html/rfc9293',
    },
    {
      title: 'Linux Kernel TCP Implementation (net/ipv4/tcp.c)',
      url: 'https://github.com/torvalds/linux/blob/master/net/ipv4/tcp.c',
    },
  ],
};
