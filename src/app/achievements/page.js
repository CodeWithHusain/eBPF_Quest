import React from 'react';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { achievementService } from '@/services/gamification/achievementService';

export const metadata = {
  title: 'Achievements & Badges — BPFQuest',
  description: 'Evidence of technical mastery across Linux internals, kernel tracing, and eBPF programming.',
};

export default async function AchievementsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id || null;

  const allAchievements = await achievementService.getUserAchievements(userId);
  const unlockedCount = allAchievements.filter((a) => a.isUnlocked).length;

  return (
    <div style={{ width: '100%' }}>
      <PageHeader
        title="Technical Achievements & Milestones"
        description="Earn badges representing real systems milestones, from process inspection to writing eBPF probes."
        badgeText={`${unlockedCount} / ${allAchievements.length} UNLOCKED`}
        badgeVariant="emerald"
        breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Dashboard', href: '/dashboard' }, { title: 'Achievements' }]}
        actions={
          <Button variant="outline" size="sm" href="/progress">
            View Progress Hub
          </Button>
        }
      />

      <Section spacing="lg">
        <Container>
          {/* Summary Progress Bar */}
          <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '8px', padding: '1.25rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600, color: '#f0f6fc' }}>Total Unlocked</span>
              <span style={{ fontFamily: 'monospace', color: '#38bdf8' }}>
                {unlockedCount} of {allAchievements.length} ({Math.round((unlockedCount / allAchievements.length) * 100)}%)
              </span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#0d1117', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${(unlockedCount / allAchievements.length) * 100}%`,
                  background: 'linear-gradient(90deg, #38bdf8 0%, #3fb950 100%)',
                }}
              />
            </div>
          </div>

          {/* Grid of Achievements */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {allAchievements.map((ach) => (
              <Card
                key={ach.slug}
                variant="bordered"
                style={{
                  background: ach.isUnlocked ? '#161b22' : '#0d1117',
                  border: ach.isUnlocked ? '1px solid #38bdf8' : '1px solid #21262d',
                  opacity: ach.isUnlocked ? 1 : 0.65,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '2.25rem' }}>{ach.icon || '◈'}</div>
                    <Badge variant={ach.isUnlocked ? 'emerald' : 'default'} size="sm">
                      {ach.isUnlocked ? '✓ Unlocked' : `+${ach.xpReward} XP`}
                    </Badge>
                  </div>

                  <h4 style={{ color: ach.isUnlocked ? '#f0f6fc' : '#8b949e', fontSize: '1.05rem', margin: '0 0 0.4rem 0' }}>
                    {ach.title}
                  </h4>
                  <p style={{ color: '#8b949e', fontSize: '0.85rem', margin: '0 0 1rem 0', lineHeight: 1.4 }}>
                    {ach.description}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid #21262d', paddingTop: '0.75rem', fontSize: '0.78rem', color: '#8b949e', fontFamily: 'monospace' }}>
                  {ach.isUnlocked ? (
                    <span style={{ color: '#3fb950' }}>
                      Unlocked {new Date(ach.unlockedAt).toLocaleDateString()}
                    </span>
                  ) : (
                    <span>Requirement: {ach.requirement}</span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </Section>
    </div>
  );
}