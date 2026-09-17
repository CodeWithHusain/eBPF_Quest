import React from 'react';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { requireAuth } from '@/lib/auth/session';
import { xpService } from '@/services/gamification/xpService';

export const metadata = {
  title: 'XP Ledger & Audit History — BPFQuest',
  description: 'Complete audit trail of user XP earnings, milestones, and reward events.',
};

export default async function XPHistoryPage() {
  const user = await requireAuth('/progress/xp');

  const [xpData, xpHistory] = await Promise.all([
    xpService.getUserXP(user.id),
    xpService.getXPHistory(user.id, 100, 0),
  ]);

  return (
    <div style={{ width: '100%' }}>
      <PageHeader
        title="XP Transaction Ledger"
        description="Every XP award is audited, verifiable, and tied to verified learning milestones."
        badgeText={`${xpData.totalXP} TOTAL XP`}
        badgeVariant="emerald"
        breadcrumbs={[
          { title: 'Home', href: '/' },
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Progress', href: '/progress' },
          { title: 'XP History' },
        ]}
        actions={
          <Button variant="outline" size="sm" href="/progress">
            ← Back to Progress Hub
          </Button>
        }
      />

      <Section spacing="lg">
        <Container>
          <Card variant="bordered">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', color: '#f0f6fc', margin: 0 }}>Transaction Audit Trail</h3>
                <span style={{ fontSize: '0.85rem', color: '#8b949e' }}>Showing newest transactions first</span>
              </div>
              <Badge variant="cyan" size="sm">
                Level {xpData.currentLevel} · {xpData.rank}
              </Badge>
            </div>

            {xpHistory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#8b949e' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📜</div>
                <div style={{ fontWeight: 600, color: '#f0f6fc' }}>No transactions recorded yet</div>
                <p style={{ maxWidth: '400px', margin: '0.5rem auto 1rem auto', fontSize: '0.88rem' }}>
                  Complete curriculum lessons or solve hands-on missions to build your immutable skill ledger.
                </p>
                <Button variant="primary" size="sm" href="/learn">
                  Start Learning
                </Button>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #30363d', color: '#8b949e', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>TIMESTAMP</th>
                      <th style={{ padding: '0.75rem 1rem' }}>REASON & MILESTONE</th>
                      <th style={{ padding: '0.75rem 1rem' }}>CATEGORY</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>XP AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {xpHistory.map((tx) => (
                      <tr key={tx.id} style={{ borderBottom: '1px solid #21262d' }}>
                        <td style={{ padding: '0.75rem 1rem', color: '#8b949e', fontFamily: 'monospace', fontSize: '0.82rem' }}>
                          {new Date(tx.createdAt).toLocaleString()}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: '#f0f6fc', fontWeight: 500 }}>
                          {tx.reason}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <Badge variant="default" size="sm">
                            {tx.sourceType}
                          </Badge>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700, color: '#3fb950', fontFamily: 'monospace' }}>
                          +{tx.amount} XP
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </Container>
      </Section>
    </div>
  );
}