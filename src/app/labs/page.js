import React from 'react';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import CodeBlock from '@/components/ui/CodeBlock';
import { defaultLabOrchestrator } from '@/services/labs/labOrchestrator';

export const metadata = {
  title: 'Sandboxed Labs — Ephemeral Linux & eBPF Environments',
  description: 'Isolated container and microVM execution infrastructure for safe Linux kernel programming.',
};

export default async function LabsPage() {
  let activeProvider = null;
  try {
    activeProvider = await defaultLabOrchestrator.resolveProvider();
  } catch (err) {
    activeProvider = { id: 'none', name: 'Unavailable' };
  }

  return (
    <div>
      <PageHeader
        title="Sandboxed Linux Labs"
        description="Dedicated, isolated kernel environments provisioned on-demand. Practice systems programming and eBPF tracing with strict security bounds."
        badgeText="ISOLATION INFRASTRUCTURE"
        badgeVariant="emerald"
        breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Labs' }]}
      />

      <Section spacing="lg">
        <Container>
          {/* Active Lab Runner Status Banner */}
          <div
            style={{
              background: '#161b22',
              border: '1px solid #30363d',
              borderRadius: '8px',
              padding: '1.25rem 1.5rem',
              marginBottom: '2rem',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <Badge variant={activeProvider.id === 'container' ? 'purple' : 'cyan'} size="sm">
                  {activeProvider.id === 'container' ? 'OCI CONTAINER RUNNER' : 'SAFE MOCK RUNNER'}
                </Badge>
                <span style={{ fontSize: '0.85rem', color: '#3fb950', fontWeight: 600 }}>● Active & Healthy</span>
              </div>
              <div style={{ color: '#f0f6fc', fontWeight: 600, fontSize: '1.05rem' }}>
                {activeProvider.name}
              </div>
              <div style={{ color: '#8b949e', fontSize: '0.82rem', marginTop: '0.2rem' }}>
                {activeProvider.id === 'container'
                  ? 'Executing isolated jobs within disposable, unprivileged Linux containers with zero network access.'
                  : 'Operating in deterministic development mode. Verifies syntax, simulation state, and ELF symbols safely without host risk.'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button variant="outline" size="sm" href="/playground">
                Try Playground →
              </Button>
              <Button variant="primary" size="sm" href="/missions">
                Start Missions →
              </Button>
            </div>
          </div>

          {/* Sandbox Security Architecture Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <Card variant="bordered">
              <Badge variant="cyan" style={{ marginBottom: '0.75rem' }}>STRICT BOUNDARIES</Badge>
              <h3 style={{ fontSize: '1.15rem', color: '#f0f6fc', marginBottom: '0.5rem' }}>
                Zero Host Code Execution
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#8b949e', lineHeight: 1.6, marginBottom: '1rem' }}>
                User submissions are <strong>never</strong> compiled, linked, or executed on the web application server.
                Workloads run exclusively within ephemeral, disposable sandboxes deallocated immediately after completion.
              </p>
              <ul style={{ fontSize: '0.85rem', color: '#c9d1d9', paddingLeft: '1.2rem', lineHeight: 1.6 }}>
                <li>Host <code>/var/run/docker.sock</code> is NEVER mounted.</li>
                <li>Host root and home directories are strictly protected.</li>
                <li>Sensitive environment variables are scrubbed by allowlists.</li>
              </ul>
            </Card>

            <Card variant="bordered">
              <Badge variant="orange" style={{ marginBottom: '0.75rem' }}>RESOURCE ENVELOPE</Badge>
              <h3 style={{ fontSize: '1.15rem', color: '#f0f6fc', marginBottom: '0.5rem' }}>
                Hard Resource & Timeout Ceilings
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#8b949e', lineHeight: 1.6, marginBottom: '1rem' }}>
                Every sandbox session operates within strict system limits to protect infrastructure against fork-bombs and denial-of-service:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.82rem', fontFamily: 'monospace' }}>
                <div style={{ background: '#0d1117', padding: '0.5rem', borderRadius: '4px', border: '1px solid #30363d' }}>
                  <span style={{ color: '#8b949e' }}>CPU:</span> 1.0 vCPU
                </div>
                <div style={{ background: '#0d1117', padding: '0.5rem', borderRadius: '4px', border: '1px solid #30363d' }}>
                  <span style={{ color: '#8b949e' }}>RAM:</span> 256 MB Max
                </div>
                <div style={{ background: '#0d1117', padding: '0.5rem', borderRadius: '4px', border: '1px solid #30363d' }}>
                  <span style={{ color: '#8b949e' }}>PIDs:</span> 64 Max
                </div>
                <div style={{ background: '#0d1117', padding: '0.5rem', borderRadius: '4px', border: '1px solid #30363d' }}>
                  <span style={{ color: '#8b949e' }}>Timeout:</span> 15 Seconds
                </div>
              </div>
            </Card>

            <Card variant="bordered">
              <Badge variant="emerald" style={{ marginBottom: '0.75rem' }}>NETWORK ISOLATION</Badge>
              <h3 style={{ fontSize: '1.15rem', color: '#f0f6fc', marginBottom: '0.5rem' }}>
                Zero Internet Egress
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#8b949e', lineHeight: 1.6, marginBottom: '1rem' }}>
                Lab runners execute on an isolated network bridge with outbound routing disabled (<code>--network none</code>).
                User workloads cannot scan external networks, beacon out, or communicate with unauthorized endpoints.
              </p>
              <ul style={{ fontSize: '0.85rem', color: '#c9d1d9', paddingLeft: '1.2rem', lineHeight: 1.6 }}>
                <li>No internet egress or ingress.</li>
                <li>Strict isolated bridge network for multi-node tasks.</li>
                <li>Output buffer capped at 64KB maximum.</li>
              </ul>
            </Card>
          </div>

          {/* Docker Lab Runner Setup Guide */}
          <Card variant="bordered">
            <h3 style={{ fontSize: '1.15rem', color: '#f0f6fc', marginBottom: '0.5rem' }}>
              How Lab Runner Orchestration Operates
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#8b949e', lineHeight: 1.6, marginBottom: '1rem' }}>
              When running in a self-hosted or production environment with Docker enabled:
            </p>
            <CodeBlock
              language="bash"
              title="Starting the isolated lab infrastructure"
              code={`# 1. Start the isolated lab runner stack
docker compose -f docker-compose.lab.yml up -d

# 2. Configure the web application environment
ENABLE_CONTAINER_LABS=true
LAB_ORCHESTRATION_SERVICE_URL=http://localhost:8080

# 3. Verify health probe status
curl http://localhost:3000/api/health/readiness`}
            />
          </Card>
        </Container>
      </Section>
    </div>
  );
}
