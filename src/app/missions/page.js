import React from 'react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { missionService } from '@/services/missionService';
import { getUserMissionsStatus } from '@/lib/db/missions';
import styles from './missions.module.css';

export const metadata = {
  title: 'Missions — Practical Systems Challenges',
  description: 'Hands-on Linux internals, process tracing, and eBPF kernel challenges.',
};

export default async function MissionsPage({ searchParams }) {
  const session = await getServerSession(authOptions);

  const selectedCategory = searchParams?.category || 'ALL';
  const selectedDifficulty = searchParams?.difficulty || 'ALL';
  const selectedStatus = searchParams?.status || 'ALL';

  const allMissions = await missionService.getPublishedMissions();

  // Fetch real user mission statuses
  let userStatuses = {};
  if (session?.user?.id) {
    userStatuses = await getUserMissionsStatus(session.user.id);
  }

  // Filter missions
  const filteredMissions = allMissions.filter((mission) => {
    // Category filter
    if (
      selectedCategory !== 'ALL' &&
      mission.category.toUpperCase() !== selectedCategory.toUpperCase()
    ) {
      return false;
    }

    // Difficulty filter
    if (
      selectedDifficulty !== 'ALL' &&
      mission.difficulty.toUpperCase() !== selectedDifficulty.toUpperCase()
    ) {
      return false;
    }

    // Status filter
    if (selectedStatus !== 'ALL') {
      const userState = userStatuses[mission.slug]?.status || 'NOT_STARTED';
      if (selectedStatus === 'COMPLETED' && userState !== 'COMPLETED') return false;
      if (selectedStatus === 'IN_PROGRESS' && userState !== 'IN_PROGRESS') return false;
      if (selectedStatus === 'NOT_STARTED' && userState !== 'NOT_STARTED') return false;
    }

    return true;
  });

  const categories = ['ALL', 'LINUX', 'TRACING', 'NETWORKING', 'EBPF'];
  const difficulties = ['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

  return (
    <div>
      <PageHeader
        title="Hands-On Missions"
        description="Learn by investigating and solving real systems scenarios."
        badgeText="CHALLENGES"
        badgeVariant="orange"
        breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Missions' }]}
      />

      <Section spacing="lg">
        <Container>
          {/* Filters Bar */}
          <div className={styles.filterSection}>
            {/* Category Filter */}
            <div className={styles.filterRow}>
              <span className={styles.filterLabel}>Category:</span>
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/missions?category=${cat}&difficulty=${selectedDifficulty}&status=${selectedStatus}`}
                  className={`${styles.filterBtn} ${
                    selectedCategory.toUpperCase() === cat ? styles.filterBtnActive : ''
                  }`}
                >
                  {cat === 'ALL' ? 'All Categories' : cat}
                </Link>
              ))}
            </div>

            {/* Difficulty Filter */}
            <div className={styles.filterRow}>
              <span className={styles.filterLabel}>Difficulty:</span>
              {difficulties.map((diff) => (
                <Link
                  key={diff}
                  href={`/missions?category=${selectedCategory}&difficulty=${diff}&status=${selectedStatus}`}
                  className={`${styles.filterBtn} ${
                    selectedDifficulty.toUpperCase() === diff ? styles.filterBtnActive : ''
                  }`}
                >
                  {diff === 'ALL' ? 'All Difficulties' : diff}
                </Link>
              ))}
            </div>

            {/* Authenticated Status Filter */}
            {session?.user && (
              <div className={styles.filterRow}>
                <span className={styles.filterLabel}>My Status:</span>
                {['ALL', 'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'].map((st) => (
                  <Link
                    key={st}
                    href={`/missions?category=${selectedCategory}&difficulty=${selectedDifficulty}&status=${st}`}
                    className={`${styles.filterBtn} ${
                      selectedStatus === st ? styles.filterBtnActive : ''
                    }`}
                  >
                    {st === 'ALL'
                      ? 'All'
                      : st === 'NOT_STARTED'
                      ? 'Not Started'
                      : st === 'IN_PROGRESS'
                      ? 'In Progress'
                      : 'Completed'}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Missions Grid */}
          <div className={styles.missionsGrid}>
            {filteredMissions.map((mission) => {
              const userState = userStatuses[mission.slug]?.status || 'NOT_STARTED';

              return (
                <Card
                  key={mission.slug}
                  variant="interactive"
                  className={styles.missionCard}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.badgeRow}>
                      <Badge
                        variant={
                          mission.category === 'LINUX'
                            ? 'cyan'
                            : mission.category === 'TRACING'
                            ? 'orange'
                            : mission.category === 'NETWORKING'
                            ? 'emerald'
                            : 'purple'
                        }
                        size="sm"
                      >
                        {mission.category}
                      </Badge>
                      <Badge
                        variant={
                          mission.difficulty === 'BEGINNER'
                            ? 'emerald'
                            : 'orange'
                        }
                        size="sm"
                      >
                        {mission.difficulty}
                      </Badge>
                    </div>

                    <span className={styles.timeMeta}>
                      ⏱ ~{mission.estimatedMinutes}m
                    </span>
                  </div>

                  <h3 className={styles.title}>{mission.title}</h3>
                  <p className={styles.desc}>
                    {mission.shortDescription || mission.description}
                  </p>

                  {/* Objectives Mini preview */}
                  {mission.objectives?.length > 0 && (
                    <div className={styles.objectivesMini}>
                      <div className={styles.objectivesMiniTitle}>Objectives</div>
                      <ul className={styles.objectivesMiniList}>
                        {mission.objectives.slice(0, 2).map((obj, i) => (
                          <li key={i}>• {obj.title}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className={styles.cardFooter}>
                    <div className={styles.statusIndicator}>
                      {userState === 'COMPLETED' ? (
                        <span className={styles.statusCompleted}>✓ Completed</span>
                      ) : userState === 'IN_PROGRESS' ? (
                        <span className={styles.statusInProgress}>● In Progress</span>
                      ) : (
                        <span>○ Not Started</span>
                      )}
                    </div>

                    <Button
                      variant={userState === 'COMPLETED' ? 'secondary' : 'primary'}
                      size="sm"
                      href={`/missions/${mission.slug}`}
                    >
                      {userState === 'COMPLETED'
                        ? 'Review'
                        : userState === 'IN_PROGRESS'
                        ? 'Continue'
                        : 'View Mission'} →
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </Container>
      </Section>
    </div>
  );
}
