import React from 'react';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import XPBar from '@/components/ui/XPBar';
import { requireAuth } from '@/lib/auth/session';
import { xpService } from '@/services/gamification/xpService';
import { streakService } from '@/services/gamification/streakService';
import { getUserCourseProgress } from '@/lib/db/learning';
import { getUserMissionStats } from '@/lib/db/missions';

export const metadata = {
  title: 'Your Progress — BPFQuest',
  description: 'Track your systems learning progress, XP history, and streak milestones.',
};

export default async function ProgressPage() {
  const user = await requireAuth('/progress');

  const [xpData, streakData, xpHistory, linuxProgress, missionStats] = await Promise.all([
    xpService.getUserXP(user.id),
    streakService.getUserStreak(user.id),
    xpService.getXPHistory(user.id, 25, 0),
    getUserCourseProgress(user.id, 'linux-fundamentals'),
    getUserMissionStats(user.id),
  ]);

  return (
    <div style={{ width: '100%' }}>
      <PageHeader
        title="Your Learning Progress"
        description="Transparent telemetry of completed curriculum, hands-on challenges, and XP transactions."
        badgeText={xpData.rank.toUpperCase()}
        badgeVariant="cyan"
        breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Dashboard', href: '/dashboard' }, { title: 'Progress' }]}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="outline" size="sm" href="/progress/xp">
              View Full XP Ledger
            </Button>
            <Button variant="outline" size="sm" href="/achievements">
              Achievements
            </Button>
          </div>
        }
      />

      <Section spacing="lg">
        <Container>
          {/* Level & XP Progress Hero */}
          <div style={{ marginBottom: '2rem' }}>
            <XPBar
              currentLevel={xpData.currentLevel}
              rank={xpData.rank}
              xpInCurrentLevel={xpData.xpInCurrentLevel}
              xpNeededForNextLevel={xpData.xpNeededForNextLevel}
              progressPercent={xpData.progressPercent}
              totalXP={xpData.totalXP}
            />
          </div>

          {/* Key Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <Card variant="bordered">
              <div style={{ fontSize: '0.8rem', color: '#8b949e', textTransform: 'uppercase', fontFamily: 'monospace' }}>Streak</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f59e0b', marginTop: '0.25rem' }}>
                🔥 {streakData.currentStreak} {streakData.currentStreak === 1 ? 'day' : 'days'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#8b949e', marginTop: '0.25rem' }}>
                Personal Best: {streakData.longestStreak} days
              </div>
            </Card>

            <Card variant="bordered">
              <div style={{ fontSize: '0.8rem', color: '#8b949e', textTransform: 'uppercase', fontFamily: 'monospace' }}>Total XP</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#38bdf8', marginTop: '0.25rem' }}>
                {xpData.totalXP} XP
              </div>
              <div style={{ fontSize: '0.8rem', color: '#8b949e', marginTop: '0.25rem' }}>
                Rank: {xpData.rank}
              </div>
            </Card>

            <Card variant="bordered">
              <div style={{ fontSize: '0.8rem', color: '#8b949e', textTransform: 'uppercase', fontFamily: 'monospace' }}>Lessons Passed</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#10b981', marginTop: '0.25rem' }}>
                {linuxProgress.completedLessons}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#8b949e', marginTop: '0.25rem' }}>
                {linuxProgress.percentage}% of Linux Fundamentals
              </div>
            </Card>

            <Card variant="bordered">
              <div style={{ fontSize: '0.8rem', color: '#8b949e', textTransform: 'uppercase', fontFamily: 'monospace' }}>Missions Won</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#a855f7', marginTop: '0.25rem' }}>
                {missionStats.completedCount}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#8b949e', marginTop: '0.25rem' }}>
                {missionStats.inProgressCount} in progress
              </div>
            </Card>
          </div>

          {/* Detailed Course & Activity Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {/* Courses Overview */}
            <Card variant="bordered">
              <h3 style={{ color: '#f0f6fc', fontSize: '1.1rem', marginBottom: '1rem' }}>Curriculum Progress</h3>

              <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: '8px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 600, color: '#f0f6fc' }}>Linux Fundamentals</div>
                  <Badge variant={linuxProgress.isCompleted ? 'emerald' : linuxProgress.completedLessons > 0 ? 'cyan' : 'default'} size="sm">
                    {linuxProgress.percentage}%
                  </Badge>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#8b949e', margin: '0.5rem 0' }}>
                  {linuxProgress.completedLessons} of {linuxProgress.totalLessons} lessons completed
                </div>
                <div style={{ height: '8px', background: '#161b22', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${linuxProgress.percentage}%`, background: '#38bdf8' }} />
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <Button variant="outline" size="sm" href="/learn/linux-fundamentals">
                    Open Course →
                  </Button>
                </div>
              </div>
            </Card>

            {/* XP History Feed */}
            <Card variant="bordered">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ color: '#f0f6fc', fontSize: '1.1rem', margin: 0 }}>Recent XP Ledger</h3>
                <Button variant="ghost" size="sm" href="/progress/xp">
                  Full Ledger →
                </Button>
              </div>

              {xpHistory.length === 0 ? (
                <div style={{ color: '#8b949e', fontStyle: 'italic', padding: '1rem 0' }}>
                  No XP transactions recorded yet. Complete lessons or missions to build your record.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {xpHistory.slice(0, 6).map((tx) => (
                    <div
                      key={tx.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.6rem 0.8rem',
                        background: '#0d1117',
                        border: '1px solid #30363d',
                        borderRadius: '6px',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.88rem', color: '#f0f6fc' }}>{tx.reason}</div>
                        <div style={{ fontSize: '0.75rem', color: '#8b949e', fontFamily: 'monospace' }}>
                          {new Date(tx.createdAt).toLocaleDateString()} • {tx.sourceType}
                        </div>
                      </div>
                      <span style={{ fontWeight: 700, color: '#3fb950', fontFamily: 'monospace' }}>
                        +{tx.amount} XP
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </Container>
      </Section>
    </div>
  );
}