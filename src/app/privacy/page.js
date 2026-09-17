import React from 'react';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';

export const metadata = {
  title: 'Privacy Policy — BPFQuest',
  description: 'BPFQuest privacy principles and zero-tracking commitment.',
};

export default function PrivacyPage() {
  return (
    <div>
      <PageHeader
        title="Privacy Policy"
        description="BPFQuest is an open-source educational platform. We believe in privacy by default and zero intrusive telemetry."
        badgeText="OPEN PRIVACY"
        badgeVariant="cyan"
        breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Privacy Policy' }]}
      />

      <Section spacing="lg">
        <Container size="narrow">
          <Card variant="bordered" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div>
              <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
                1. Open & Minimal Data Collection
              </h2>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--line-height-relaxed)' }}>
                BPFQuest does not sell user data, run third-party tracker pixels, or collect unnecessary telemetry. In current stages, curriculum progress is maintained in the client browser session.
              </p>
            </div>

            <div>
              <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
                2. Lab Sessions & Code Execution
              </h2>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--line-height-relaxed)' }}>
                When ephemeral lab environments are launched in later stages, terminal sessions exist only in temporary memory and are deleted immediately upon lab expiration.
              </p>
            </div>

            <div>
              <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
                3. Open Source Transparency
              </h2>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--line-height-relaxed)' }}>
                The full source code of BPFQuest is available publicly on GitHub for audit and review under the Apache-2.0 license.
              </p>
            </div>
          </Card>
        </Container>
      </Section>
    </div>
  );
}
