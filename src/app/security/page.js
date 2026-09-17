import React from 'react';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import CodeBlock from '@/components/ui/CodeBlock';
import Badge from '@/components/ui/Badge';

export const metadata = {
  title: 'Security Policy — BPFQuest',
  description: 'Security architecture, sandboxing boundaries, and vulnerability reporting.',
};

export default function SecurityPage() {
  return (
    <div>
      <PageHeader
        title="Security & Isolation Architecture"
        description="Treating low-level Linux and eBPF execution with defense-in-depth isolation."
        badgeText="DEFENSE IN DEPTH"
        badgeVariant="emerald"
        breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Security' }]}
      />

      <Section spacing="lg">
        <Container size="narrow">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <Card variant="bordered">
              <Badge variant="cyan" style={{ marginBottom: 'var(--space-3)' }}>SANDBOX BOUNDARIES</Badge>
              <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
                Host Machine Safety
              </h2>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--line-height-relaxed)', marginBottom: 'var(--space-4)' }}>
                BPFQuest never executes user-submitted code or shell processes on the application host. All execution in future stages is delegated to hardware-isolated microVMs with strict memory and CPU quotas.
              </p>
              <CodeBlock
                language="bash"
                title="isolation_model.txt"
                code={`Host OS (Production Web Server)
 └── [FIREWALL & STRICT BOUNDARY]
      └── Firecracker MicroVM (Ephemeral, Read-Only Root)
           ├── Custom Minimal Kernel 6.8 (CONFIG_BPF=y)
           ├── BPF Verifier Safety Guardrails
           └── 30-minute Hard Lifetime Limit`}
              />
            </Card>

            <Card variant="bordered">
              <Badge variant="orange" style={{ marginBottom: 'var(--space-3)' }}>DISCLOSURE</Badge>
              <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
                Vulnerability Reporting
              </h2>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--line-height-relaxed)' }}>
                Please disclose potential security issues responsibly via private GitHub Security Advisories or by contacting <code style={{ color: 'var(--accent-cyan)' }}>security@bpfquest.org</code>. We aim to respond within 48 hours.
              </p>
            </Card>
          </div>
        </Container>
      </Section>
    </div>
  );
}
