import React from 'react';
import Link from 'next/link';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import CodeBlock from '@/components/ui/CodeBlock';

export const metadata = {
  title: 'Documentation — BPFQuest Technical Reference',
  description: 'Technical architecture, eBPF mechanics, kernel cheat sheets, missions guide, and contribution guidelines.',
};

export default function DocsPage() {
  const sections = [
    {
      id: 'getting-started',
      badge: 'GETTING STARTED',
      variant: 'cyan',
      title: '1. What is BPFQuest?',
      content: (
        <>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
            <strong>BPFQuest</strong> is an open-source, hands-on learning platform engineered specifically for
            mastering <strong>Linux internals, eBPF (Extended Berkeley Packet Filter), kernel observability, tracing, networking, and systems security</strong>.
          </p>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
            Unlike generic web tutorials or abstract textbooks, BPFQuest combines:
          </p>
          <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.25rem', lineHeight: 1.6, marginBottom: '1rem' }}>
            <li><strong>Structured Curriculum:</strong> Step-by-step modular lessons explaining hardware protection rings, virtual filesystems, and syscall dispatching.</li>
            <li><strong>Practical Missions:</strong> Real problem scenarios modeled after production system investigations and rogue process tracing.</li>
            <li><strong>eBPF Playground:</strong> In-browser C and eBPF editor with syntax highlighting, compilation validation, and sample output.</li>
            <li><strong>Sandboxed Labs:</strong> Ephemeral, zero-host-execution container and microVM execution environments.</li>
            <li><strong>Skill Gamification:</strong> Server-side deterministic XP, streaks, and milestone achievements.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'linux-fundamentals',
      badge: 'LINUX ARCHITECTURE',
      variant: 'emerald',
      title: '2. Linux Architecture & Hardware Rings',
      content: (
        <>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
            At the foundation of systems programming is the separation of privilege between <strong>User Space (Ring 3)</strong> and <strong>Kernel Space (Ring 0)</strong>:
          </p>
          <CodeBlock
            language="text"
            title="CPU Privilege Boundaries"
            code={`Ring 3 (User Space)   : Web browsers, daemons, user CLI tools (unprivileged)
      │
      ▼ System Call (syscall instruction: %rax holds syscall number)
      │
Ring 0 (Kernel Space) : Linux Kernel, VFS, Memory Manager, Network Stack, Drivers`}
          />
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '1rem' }}>
            Every interaction with files, sockets, and hardware transitions through a system call mediated by the kernel.
            Tracing tools like <code>strace</code>, <code>perf</code>, and eBPF attach probes to these transitions to observe system behavior with minimal overhead.
          </p>
        </>
      ),
    },
    {
      id: 'ebpf-architecture',
      badge: 'EBPF INTERNALS',
      variant: 'purple',
      title: '3. eBPF Architecture & The Kernel Verifier',
      content: (
        <>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
            eBPF is a revolutionary technology that allows running sandboxed programs inside the Linux kernel without changing kernel source code or loading unstable kernel modules (LKMs).
          </p>
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>The Verification Pipeline:</h4>
          <ol style={{ color: 'var(--text-secondary)', paddingLeft: '1.25rem', lineHeight: 1.6, marginBottom: '1rem' }}>
            <li><strong>Compilation:</strong> C code is compiled by Clang/LLVM with target <code>-target bpf</code> into an ELF bytecode binary.</li>
            <li><strong>Loading:</strong> The userspace loader invokes <code>bpf(BPF_PROG_LOAD, ...)</code>.</li>
            <li><strong>Verifier Proofs:</strong> The kernel verifier simulates all execution paths. It mathematically guarantees that the program has no unbounded loops, never dereferences NULL or unaligned pointers, and cannot panic the kernel.</li>
            <li><strong>JIT Compilation:</strong> Once proven safe, the in-kernel JIT compiler compiles the bytecode into native machine instructions (x86_64, ARM64).</li>
          </ol>
          <CodeBlock
            language="c"
            title="Key eBPF Map Types (bpf.h)"
            code={`BPF_MAP_TYPE_HASH             // Arbitrary key-value lookup table
BPF_MAP_TYPE_ARRAY            // Fast, fixed-size indexed array
BPF_MAP_TYPE_PERF_EVENT_ARRAY // Ring buffer streaming events to userspace
BPF_MAP_TYPE_RINGBUF          // High-performance single multi-producer buffer
BPF_MAP_TYPE_LRU_HASH         // Cache with automatic eviction of oldest entries
BPF_MAP_TYPE_PROG_ARRAY       // Tail calls for chaining eBPF programs`}
          />
        </>
      ),
    },
    {
      id: 'playground-guide',
      badge: 'PLAYGROUND',
      variant: 'cyan',
      title: '4. Interactive eBPF Playground',
      content: (
        <>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
            The BPFQuest Playground (<code>/playground</code>) provides an educational browser environment for exploring eBPF code:
          </p>
          <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.25rem', lineHeight: 1.6, marginBottom: '1rem' }}>
            <li><strong>Monaco Editor:</strong> Full C syntax highlighting, tab stops, and keyboard navigation.</li>
            <li><strong>Static Pre-flight Validator:</strong> Verifies ELF section directives (<code>SEC(...)</code>), map declarations, and bounded source size (&lt; 50KB).</li>
            <li><strong>Execution Dispatch:</strong> Connected to the asynchronous execution queue and safe lab orchestrator.</li>
          </ul>
          <Button variant="outline" size="sm" href="/playground">
            Open eBPF Playground →
          </Button>
        </>
      ),
    },
    {
      id: 'missions-guide',
      badge: 'MISSIONS',
      variant: 'orange',
      title: '5. Hands-On Challenges & Validation',
      content: (
        <>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
            Missions are scenario-driven challenges where you investigate realistic Linux phenomena:
          </p>
          <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.25rem', lineHeight: 1.6, marginBottom: '1rem' }}>
            <li><strong>Observe a Process:</strong> Inspect PID/PPID hierarchy and virtual memory maps in <code>/proc</code>.</li>
            <li><strong>Explore File Descriptors:</strong> Track open file streams and identify leaking descriptors.</li>
            <li><strong>Network Interface Discovery:</strong> Check MTU constraints and interface operational states with <code>ip</code>.</li>
            <li><strong>Trace Kernel Events:</strong> Structure tracepoint probe hooks for <code>sched_process_exec</code>.</li>
            <li><strong>First eBPF Program:</strong> Write a verified probe with bounded helper returns.</li>
          </ul>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            All validations are conducted <strong>strictly server-side</strong> using deterministic evaluation logic. Client tampering cannot fabricate a passing score.
          </p>
        </>
      ),
    },
    {
      id: 'labs-architecture',
      badge: 'SANDBOXED LABS',
      variant: 'emerald',
      title: '6. Lab Isolation & Security Invariants',
      content: (
        <>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
            BPFQuest enforces a strict zero-trust sandbox architecture:
          </p>
          <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.25rem', lineHeight: 1.6, marginBottom: '1rem' }}>
            <li><strong>Zero Host Execution:</strong> User submissions are NEVER executed on the web application host.</li>
            <li><strong>No Docker Socket Exposure:</strong> <code>/var/run/docker.sock</code> is never mounted into user containers.</li>
            <li><strong>No Internet Egress:</strong> Sandboxed lab networks operate with <code>--network none</code>.</li>
            <li><strong>Resource Caps:</strong> 256MB RAM limit, 1 vCPU cap, 64 PIDs ceiling (anti-forkbomb), and 15s execution timeout.</li>
            <li><strong>Guaranteed Teardown:</strong> Ephemeral environments are cleaned up via deterministic finally-blocks and automated reapers.</li>
          </ul>
          <Button variant="outline" size="sm" href="/labs">
            View Labs Hub →
          </Button>
        </>
      ),
    },
    {
      id: 'contributing-guide',
      badge: 'OPEN SOURCE',
      variant: 'cyan',
      title: '7. Contributing to BPFQuest',
      content: (
        <>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
            BPFQuest is 100% open source under the <strong>Apache-2.0 License</strong>. We actively welcome contributions from developers, educators, and kernel researchers:
          </p>
          <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.25rem', lineHeight: 1.6, marginBottom: '1rem' }}>
            <li><strong>Curriculum:</strong> Add new lessons to <code>src/content/lessons/</code> following our educational schema.</li>
            <li><strong>Missions:</strong> Propose real systems troubleshooting challenges in <code>src/content/missions/</code>.</li>
            <li><strong>Playground Examples:</strong> Submit canonical eBPF examples to <code>src/content/playground/</code>.</li>
            <li><strong>Platform Code:</strong> Improve accessibility, security controls, and lab providers.</li>
          </ul>
          <Button variant="outline" size="sm" href="https://github.com/bpfquest/bpfquest" target="_blank" rel="noopener noreferrer">
            GitHub Repository ↗
          </Button>
        </>
      ),
    },
  ];

  return (
    <div style={{ width: '100%' }}>
      <PageHeader
        title="BPFQuest Technical Documentation"
        description="Comprehensive technical guides, Linux architecture overviews, eBPF references, lab security models, and contributor documentation."
        badgeText="V1.0 REFERENCE"
        badgeVariant="cyan"
        breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Documentation' }]}
      />

      <Section spacing="lg">
        <Container>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            {sections.map((sec) => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                style={{
                  textDecoration: 'none',
                  background: '#161b22',
                  border: '1px solid #30363d',
                  borderRadius: '8px',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'border-color 0.2s',
                }}
              >
                <div>
                  <Badge variant={sec.variant} size="sm" style={{ marginBottom: '0.4rem' }}>{sec.badge}</Badge>
                  <div style={{ color: '#f0f6fc', fontWeight: 600, fontSize: '0.95rem' }}>{sec.title}</div>
                </div>
                <span style={{ color: '#8b949e', fontSize: '1.2rem' }}>↓</span>
              </a>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {sections.map((sec) => (
              <Card key={sec.id} variant="bordered" id={sec.id} style={{ scrollMarginTop: '5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <Badge variant={sec.variant} size="sm">{sec.badge}</Badge>
                </div>
                <h3 style={{ fontSize: '1.4rem', color: '#f0f6fc', marginBottom: '1rem' }}>
                  {sec.title}
                </h3>
                {sec.content}
              </Card>
            ))}
          </div>
        </Container>
      </Section>
    </div>
  );
}
