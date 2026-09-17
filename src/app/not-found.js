import React from 'react';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <Section spacing="xl">
      <Container size="narrow">
        <Card variant="terminal" style={{ textAlign: 'center', padding: 'var(--space-12) var(--space-6)' }}>
          <Badge variant="orange" size="md" style={{ marginBottom: 'var(--space-4)' }}>
            ERR_404_PAGE_FAULT
          </Badge>
          <h1 style={{ fontSize: 'var(--text-3xl)', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
            Address Translation Fault
          </h1>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', marginBottom: 'var(--space-6)', maxWidth: '440px', margin: '0 auto var(--space-6) auto' }}>
            The kernel page table could not map the requested virtual address. The route does not exist or has been relocated.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)' }}>
            <Button variant="primary" href="/">
              Return to Kernel Root (/)
            </Button>
            <Button variant="outline" href="/learn">
              Browse Curriculum
            </Button>
          </div>
        </Card>
      </Container>
    </Section>
  );
}
