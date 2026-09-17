import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import PageHeader from '@/components/ui/PageHeader';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import MissionObjectivesList from '@/components/missions/MissionObjectivesList';
import ProgressiveHints from '@/components/missions/ProgressiveHints';
import MissionWorkspace from '@/components/missions/MissionWorkspace';
import { getMissionWithUserStatus } from '@/lib/db/missions';
import styles from './missionDetail.module.css';

export async function generateMetadata({ params }) {
  const mission = await getMissionWithUserStatus(params.slug);
  if (!mission) return { title: 'Mission Not Found — BPFQuest' };
  return {
    title: `${mission.title} — Mission — BPFQuest`,
    description: mission.shortDescription || mission.description,
  };
}

export default async function MissionDetailPage({ params }) {
  const { slug } = params;
  const session = await getServerSession(authOptions);

  const mission = await getMissionWithUserStatus(slug, session?.user?.id);

  if (!mission) {
    notFound();
  }

  const { userStatus } = mission;

  return (
    <div className={styles.page}>
      <PageHeader
        title={mission.title}
        description={mission.shortDescription || mission.description}
        badgeText={mission.category}
        badgeVariant={
          mission.category === 'LINUX'
            ? 'cyan'
            : mission.category === 'TRACING'
            ? 'orange'
            : mission.category === 'NETWORKING'
            ? 'emerald'
            : 'purple'
        }
        breadcrumbs={[
          { title: 'Home', href: '/' },
          { title: 'Missions', href: '/missions' },
          { title: mission.title },
        ]}
      />

      <Section spacing="lg">
        <Container>
          <div className={styles.missionLayout}>
            {/* Left Main Column */}
            <div className={styles.mainColumn}>
              {/* Scenario Context / Story */}
              {mission.story && (
                <div className={styles.storyCard}>
                  <h3 className={styles.storyHeading}>
                    <span>📜</span> Investigation Scenario
                  </h3>
                  <p className={styles.storyText}>{mission.story.trim()}</p>
                </div>
              )}

              {/* Mission Objectives */}
              <div className={styles.sectionBox}>
                <h3 className={styles.sectionTitle}>Mission Objectives</h3>
                <MissionObjectivesList
                  objectives={mission.objectives}
                  passedKeys={
                    userStatus.status === 'COMPLETED'
                      ? (mission.objectives || []).map((o) => o.validationKey)
                      : []
                  }
                />
              </div>

              {/* Instructions & Guidance */}
              {mission.instructions && (
                <div className={styles.sectionBox}>
                  <h3 className={styles.sectionTitle}>Investigation Guidance</h3>
                  <div className={styles.instructionsText}>
                    {mission.instructions
                      .trim()
                      .split('\n\n')
                      .map((p, i) => {
                        if (p.startsWith('### ')) {
                          return (
                            <h4
                              key={i}
                              style={{ color: '#58a6ff', margin: '0.5rem 0' }}
                            >
                              {p.replace('### ', '')}
                            </h4>
                          );
                        }
                        return <p key={i}>{p}</p>;
                      })}
                  </div>
                </div>
              )}

              {/* Interactive Mission Workspace (Simulated Environment) */}
              <MissionWorkspace
                missionSlug={mission.slug}
                userStatus={userStatus}
                isAuthenticated={Boolean(session?.user)}
              />
            </div>

            {/* Right Sidebar Column */}
            <aside className={styles.sidebar}>
              {/* Mission Metadata Card */}
              <div className={styles.metaCard}>
                <div className={styles.metaHeading}>Mission Information</div>

                <div className={styles.metaRow}>
                  <span className={styles.metaKey}>Category</span>
                  <span className={styles.metaVal}>{mission.category}</span>
                </div>

                <div className={styles.metaRow}>
                  <span className={styles.metaKey}>Difficulty</span>
                  <Badge
                    variant={
                      mission.difficulty === 'BEGINNER' ? 'emerald' : 'orange'
                    }
                    size="sm"
                  >
                    {mission.difficulty}
                  </Badge>
                </div>

                <div className={styles.metaRow}>
                  <span className={styles.metaKey}>Estimated Time</span>
                  <span className={styles.metaVal}>
                    ~{mission.estimatedMinutes} mins
                  </span>
                </div>

                <div className={styles.metaRow}>
                  <span className={styles.metaKey}>Your Status</span>
                  <Badge
                    variant={
                      userStatus.status === 'COMPLETED'
                        ? 'emerald'
                        : userStatus.status === 'IN_PROGRESS'
                        ? 'cyan'
                        : 'neutral'
                    }
                    size="sm"
                  >
                    {userStatus.status === 'COMPLETED'
                      ? '✓ COMPLETED'
                      : userStatus.status === 'IN_PROGRESS'
                      ? 'IN PROGRESS'
                      : 'NOT STARTED'}
                  </Badge>
                </div>
              </div>

              {/* Associated Lesson Cross-link */}
              {mission.lessonSlug && (
                <div className={styles.lessonLinkBox}>
                  <span className={styles.lessonLinkText}>
                    Recommended Preparation:
                  </span>
                  <Link
                    href={`/learn/linux-fundamentals/${mission.lessonSlug}`}
                    className={styles.lessonLinkAnchor}
                  >
                    Review Lesson: {mission.lessonSlug.replace(/-/g, ' ')} →
                  </Link>
                </div>
              )}

              {/* Try In Playground Box */}
              <div
                style={{
                  padding: '1rem',
                  background: 'rgba(16, 185, 129, 0.05)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                }}
              >
                <span style={{ fontSize: '0.78rem', color: '#8b949e', textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 700 }}>
                  Interactive Sandbox:
                </span>
                <Link
                  href={
                    slug === 'observe-a-process' || slug === 'trace-a-process-event'
                      ? '/playground/trace-process'
                      : slug === 'explore-file-descriptors'
                      ? '/playground/file-open'
                      : slug === 'find-a-network-interface'
                      ? '/playground/network-events'
                      : '/playground/hello-ebpf'
                  }
                  style={{ color: '#10b981', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'underline' }}
                >
                  Experiment in eBPF Playground →
                </Link>
              </div>

              {/* Prerequisites Card */}
              {userStatus.prerequisitesStatus?.length > 0 && (
                <div className={styles.metaCard}>
                  <div className={styles.metaHeading}>Prerequisites</div>
                  <ul className={styles.prereqList}>
                    {userStatus.prerequisitesStatus.map((req, i) => (
                      <li key={i} className={styles.prereqItem}>
                        <span
                          className={
                            req.isMet
                              ? styles.prereqIconMet
                              : styles.prereqIconUnmet
                          }
                        >
                          {req.isMet ? '✓' : '○'}
                        </span>
                        <span>{req.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Progressive Hints Accordion */}
              {mission.hints?.length > 0 && (
                <div className={styles.metaCard}>
                  <div className={styles.metaHeading}>Mission Hints</div>
                  <ProgressiveHints hints={mission.hints} />
                </div>
              )}
            </aside>
          </div>
        </Container>
      </Section>
    </div>
  );
}
