import React from 'react';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import XPBar from '@/components/ui/XPBar';
import { requireAuth } from '@/lib/auth/session';
import { getUserCourseProgress, getRecentLearningActivity } from '@/lib/db/learning';
import { getUserMissionStats } from '@/lib/db/missions';
import { xpService } from '@/services/gamification/xpService';
import { streakService } from '@/services/gamification/streakService';
import { achievementService } from '@/services/gamification/achievementService';
import { contentService } from '@/services/contentService';
import styles from './dashboard.module.css';

export const metadata = {
  title: 'Dashboard — Your Kernel Quest',
  description: 'Authenticated engineer learning dashboard, XP level, streaks, and quest milestones.',
};

export default async function DashboardPage() {
  const user = await requireAuth('/dashboard');

  const displayName = user.name || user.username || 'Engineer';
  const username = user.username ? `@${user.username}` : user.email;
  const joinedDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  // Query real data concurrently from DB
  const [
    linuxProgress,
    recentLessons,
    missionStats,
    xpData,
    streakData,
    allAchievements,
    courseLessons,
  ] = await Promise.all([
    getUserCourseProgress(user.id, 'linux-fundamentals'),
    getRecentLearningActivity(user.id, 4),
    getUserMissionStats(user.id),
    xpService.getUserXP(user.id),
    streakService.getUserStreak(user.id),
    achievementService.getUserAchievements(user.id),
    contentService.getCourseLessons('linux-fundamentals'),
  ]);

  const unlockedAchievements = allAchievements.filter((a) => a.isUnlocked);
  const coursesInProgressCount =
    linuxProgress.completedLessons > 0 && !linuxProgress.isCompleted ? 1 : 0;

  // Deterministic recommendation calculation
  let recommendation = {
    title: 'Lesson 1: What is Linux?',
    reason: 'Start your systems journey by understanding CPU execution rings (Ring 0 vs Ring 3) and monolithic kernel boundaries.',
    href: '/learn/linux-fundamentals/what-is-linux',
    actionText: 'Start Lesson',
  };

  const completedSlugs = new Set(linuxProgress.completedLessonSlugs || []);
  const nextLesson = courseLessons.find((l) => !completedSlugs.has(l.slug));

  if (nextLesson) {
    recommendation = {
      title: `${nextLesson.title}`,
      reason: `Next sequential lesson in Linux Fundamentals (${nextLesson.estimatedMinutes} min, ${nextLesson.difficulty.toLowerCase()}).`,
      href: `/learn/linux-fundamentals/${nextLesson.slug}`,
      actionText: 'Continue Lesson',
    };
  } else if (linuxProgress.isCompleted) {
    if (missionStats.completedCount === 0) {
      recommendation = {
        title: 'Mission: Observe a Process',
        reason: 'You completed Linux Fundamentals. Now practice your inspection skills on an active background daemon in /proc.',
        href: '/missions/observe-a-process',
        actionText: 'Start Mission',
      };
    } else {
      recommendation = {
        title: 'eBPF Playground: Trace Process Execution',
        reason: 'Put your Linux knowledge to work with live eBPF probes in the browser IDE.',
        href: '/playground/trace-process',
        actionText: 'Open Playground',
      };
    }
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title={`Welcome back, ${displayName}`}
        description="Your BPFQuest journey, skills, and progress telemetry."
        badgeText={xpData.rank.toUpperCase()}
        badgeVariant="cyan"
        breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Dashboard' }]}
        actions={
          <div className={styles.headerActions}>
            <Button variant="outline" size="sm" href="/progress">
              Progress Hub
            </Button>
            <Button variant="outline" size="sm" href="/achievements">
              Achievements
            </Button>
            <Button variant="primary" size="sm" href="/learn">
              Explore Curriculum
            </Button>
          </div>
        }
      />

      <Section spacing="lg">
        <Container>
          {/* XP & Streak Hero Strip */}
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

          {/* Account Overview Strip */}
          <div className={styles.accountStrip}>
            <div className={styles.userMeta}>
              <div className={styles.avatar}>
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.image} alt={displayName} className={styles.avatarImg} />
                ) : (
                  <span>{displayName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className={styles.userDetails}>
                <span className={styles.userHandle}>{username}</span>
                <span className={styles.joinDate}>Member since {joinedDate}</span>
              </div>
            </div>

            <div className={styles.statCounters}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Learning Streak</span>
                <span className={styles.statNum} style={{ color: '#f59e0b' }}>
                  🔥 {streakData.currentStreak} {streakData.currentStreak === 1 ? 'day' : 'days'}
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Total XP</span>
                <span className={styles.statNum}>{xpData.totalXP}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Achievements</span>
                <span className={styles.statNum}>
                  {unlockedAchievements.length} / {allAchievements.length}
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Missions Won</span>
                <span className={styles.statNum}>{missionStats.completedCount}</span>
              </div>
            </div>
          </div>

          {/* Deterministic Recommended Next Step Card */}
          <div style={{ marginBottom: '2rem' }}>
            <Card variant="bordered" style={{ background: 'linear-gradient(180deg, #161b22 0%, #0d1117 100%)', border: '1px solid rgba(56, 189, 248, 0.4)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <Badge variant="cyan" size="sm">RECOMMENDED NEXT STEP</Badge>
                    <span style={{ fontSize: '0.8rem', color: '#8b949e' }}>Based on your curriculum completion</span>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', color: '#f0f6fc', margin: '0 0 0.25rem 0' }}>
                    {recommendation.title}
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#8b949e', margin: 0, maxWidth: '650px' }}>
                    {recommendation.reason}
                  </p>
                </div>
                <div>
                  <Button variant="primary" size="md" href={recommendation.href}>
                    {recommendation.actionText} →
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <div className={styles.dashboardGrid}>
            {/* Learning Column */}
            <div className={styles.gridCol}>
              <Card variant="bordered" className={styles.panelCard}>
                <div className={styles.panelHeader}>
                  <div className={styles.panelTitleGroup}>
                    <Badge variant="cyan" size="sm">CURRICULUM</Badge>
                    <h3 className={styles.panelTitle}>Active Courses</h3>
                  </div>
                  <Button variant="ghost" size="sm" href="/progress">
                    View Progress →
                  </Button>
                </div>

                <div className={styles.panelBody}>
                  <div className={styles.courseItem}>
                    <div className={styles.courseInfo}>
                      <h4 className={styles.courseName}>Linux Fundamentals</h4>
                      <Badge
                        variant={
                          linuxProgress.isCompleted
                            ? 'emerald'
                            : linuxProgress.completedLessons > 0
                            ? 'cyan'
                            : 'default'
                        }
                        size="sm"
                      >
                        {linuxProgress.isCompleted
                          ? 'Completed'
                          : linuxProgress.completedLessons > 0
                          ? `${linuxProgress.percentage}% In Progress`
                          : 'Not started'}
                      </Badge>
                    </div>
                    <p className={styles.courseDesc}>
                      Master Linux kernel boundaries, processes, virtual filesystems, permissions, and network sockets before diving into eBPF.
                    </p>

                    <div className={styles.emptyProgressNote}>
                      <span>
                        {linuxProgress.completedLessons} of {linuxProgress.totalLessons} lessons completed
                      </span>
                    </div>

                    <div style={{ marginTop: '0.5rem' }}>
                      <Button
                        variant={linuxProgress.completedLessons > 0 ? 'secondary' : 'primary'}
                        size="sm"
                        href="/learn/linux-fundamentals"
                      >
                        {linuxProgress.completedLessons > 0 ? 'Continue Course' : 'Start Course'}
                      </Button>
                    </div>
                  </div>

                  {/* Recent Activity Mini-Feed */}
                  <div style={{ marginTop: '1.5rem' }}>
                    <div style={{ fontSize: '0.8rem', color: '#8b949e', textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 700, marginBottom: '0.5rem' }}>
                      Recent Completed Lessons
                    </div>
                    {recentLessons.length === 0 ? (
                      <div style={{ fontSize: '0.85rem', color: '#8b949e', fontStyle: 'italic', padding: '0.5rem 0' }}>
                        No lessons completed yet. Complete your first lesson to earn +15 XP!
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {recentLessons.map((item, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: '0.5rem 0.75rem',
                              background: '#0d1117',
                              border: '1px solid #30363d',
                              borderRadius: '6px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <div>
                              <div style={{ fontSize: '0.88rem', color: '#f0f6fc', fontWeight: 600 }}>
                                {item.lessonTitle}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#8b949e' }}>
                                {item.moduleTitle}
                              </div>
                            </div>
                            <Badge variant="emerald" size="sm">
                              +15 XP
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Hands-On Missions Column */}
            <div className={styles.gridCol}>
              <Card variant="bordered" className={styles.panelCard}>
                <div className={styles.panelHeader}>
                  <div className={styles.panelTitleGroup}>
                    <Badge variant="orange" size="sm">MISSIONS</Badge>
                    <h3 className={styles.panelTitle}>Hands-On Challenges</h3>
                  </div>
                  <Button variant="ghost" size="sm" href="/missions">
                    All Missions →
                  </Button>
                </div>

                <div className={styles.panelBody}>
                  {missionStats.completedCount === 0 && missionStats.inProgressCount === 0 ? (
                    <EmptyState
                      icon="⚔️"
                      title="No missions active yet"
                      description="Solve practical Linux and kernel tracing challenges to build real systems muscle memory."
                      actionLabel="Browse Missions"
                      actionHref="/missions"
                    />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {missionStats.inProgressMissions.length > 0 && (
                        <div>
                          <div style={{ fontSize: '0.8rem', color: '#8b949e', textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 700, marginBottom: '0.5rem' }}>
                            In Progress ({missionStats.inProgressMissions.length})
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {missionStats.inProgressMissions.map((m, idx) => (
                              <div
                                key={idx}
                                style={{
                                  padding: '0.75rem 1rem',
                                  background: '#0d1117',
                                  border: '1px solid #30363d',
                                  borderRadius: '6px',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                }}
                              >
                                <div>
                                  <div style={{ fontSize: '0.9rem', color: '#f0f6fc', fontWeight: 600 }}>
                                    {m.title}
                                  </div>
                                  <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>In Progress</span>
                                </div>
                                <Button variant="secondary" size="sm" href={`/missions/${m.slug}`}>
                                  Resume
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {missionStats.recentMissions.length > 0 && (
                        <div>
                          <div style={{ fontSize: '0.8rem', color: '#8b949e', textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 700, marginBottom: '0.5rem' }}>
                            Completed Missions ({missionStats.completedCount})
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {missionStats.recentMissions.map((m, idx) => (
                              <div
                                key={idx}
                                style={{
                                  padding: '0.75rem 1rem',
                                  background: '#0d1117',
                                  border: '1px solid #30363d',
                                  borderRadius: '6px',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                }}
                              >
                                <div>
                                  <div style={{ fontSize: '0.9rem', color: '#f0f6fc', fontWeight: 600 }}>
                                    {m.title}
                                  </div>
                                  <span style={{ fontSize: '0.75rem', color: '#10b981' }}>✓ Completed</span>
                                </div>
                                <Button variant="outline" size="sm" href={`/missions/${m.slug}`}>
                                  Review
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Achievements Spotlight Strip */}
          <div style={{ marginTop: '2rem' }}>
            <Card variant="bordered">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', color: '#f0f6fc', margin: 0 }}>Milestones & Achievements</h3>
                  <p style={{ fontSize: '0.85rem', color: '#8b949e', margin: '0.2rem 0 0 0' }}>
                    Unlock badges by completing actual Linux and eBPF milestones.
                  </p>
                </div>
                <Button variant="outline" size="sm" href="/achievements">
                  View All ({unlockedAchievements.length} / {allAchievements.length}) →
                </Button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                {allAchievements.slice(0, 4).map((ach) => (
                  <div
                    key={ach.slug}
                    style={{
                      background: ach.isUnlocked ? 'rgba(56, 189, 248, 0.05)' : '#0d1117',
                      border: ach.isUnlocked ? '1px solid #38bdf8' : '1px solid #30363d',
                      borderRadius: '8px',
                      padding: '1rem',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      opacity: ach.isUnlocked ? 1 : 0.6,
                    }}
                  >
                    <span style={{ fontSize: '1.75rem' }}>{ach.icon || '◈'}</span>
                    <div>
                      <div style={{ fontWeight: 600, color: ach.isUnlocked ? '#f0f6fc' : '#8b949e', fontSize: '0.95rem' }}>
                        {ach.title}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#8b949e', margin: '0.25rem 0' }}>
                        {ach.description}
                      </div>
                      <Badge variant={ach.isUnlocked ? 'emerald' : 'default'} size="sm">
                        {ach.isUnlocked ? '✓ Unlocked' : `Locked (+${ach.xpReward} XP)`}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </Container>
      </Section>
    </div>
  );
}