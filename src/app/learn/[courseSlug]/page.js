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
import { contentService } from '@/services/contentService';
import { getUserCourseProgress } from '@/lib/db/learning';
import styles from './course.module.css';

export async function generateMetadata({ params }) {
  const course = await contentService.getCourseBySlug(params.courseSlug);
  if (!course) return { title: 'Course Not Found — BPFQuest' };
  return {
    title: `${course.title} — Syllabus — BPFQuest`,
    description: course.shortDescription || course.description,
  };
}

export default async function CourseDetailPage({ params }) {
  const { courseSlug } = params;
  const course = await contentService.getCourseBySlug(courseSlug);

  if (!course) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  let progress = {
    totalLessons: course.lessonsCount || 0,
    completedLessons: 0,
    percentage: 0,
    completedLessonSlugs: [],
  };

  if (course.isPublished && course.modules) {
    const total = course.modules.reduce(
      (acc, m) => acc + (m.lessons?.length || 0),
      0
    );
    progress.totalLessons = total;

    if (session?.user?.id) {
      progress = await getUserCourseProgress(session.user.id, course.slug);
    }
  }

  const firstLessonSlug =
    course.modules?.[0]?.lessons?.[0]?.slug || 'what-is-linux';

  return (
    <div className={styles.page}>
      <PageHeader
        title={course.title}
        description={course.tagline || course.shortDescription}
        badgeText={course.difficulty}
        badgeVariant={
          course.difficulty === 'BEGINNER'
            ? 'emerald'
            : course.difficulty === 'INTERMEDIATE'
            ? 'orange'
            : 'purple'
        }
        breadcrumbs={[
          { title: 'Home', href: '/' },
          { title: 'Learn', href: '/learn' },
          { title: course.title },
        ]}
      />

      <Section spacing="lg">
        <Container>
          <div className={styles.overviewGrid}>
            <div className={styles.mainInfo}>
              <p className={styles.description}>{course.description}</p>

              {course.learningObjectives && course.learningObjectives.length > 0 && (
                <div className={styles.objectivesBox}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#f0f6fc' }}>
                    What You Will Learn
                  </h3>
                  <ul className={styles.objectivesList}>
                    {course.learningObjectives.map((obj, i) => (
                      <li key={i}>🎯 {obj}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className={styles.metaCard}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Status</span>
                <span className={styles.metaValue}>
                  {course.isPublished ? (
                    <Badge variant="cyan" size="sm">Available</Badge>
                  ) : (
                    <Badge variant="locked" size="sm">Coming Soon</Badge>
                  )}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Estimated Duration</span>
                <span className={styles.metaValue}>
                  {course.estimatedHours ? `${course.estimatedHours} hours` : course.estimatedTime}
                </span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Total Lessons</span>
                <span className={styles.metaValue}>{progress.totalLessons}</span>
              </div>
              {session?.user && course.isPublished && (
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Your Progress</span>
                  <span className={styles.metaValue}>{progress.percentage}%</span>
                </div>
              )}

              <div style={{ marginTop: '0.5rem' }}>
                {course.isPublished ? (
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    href={`/learn/${course.slug}/${firstLessonSlug}`}
                  >
                    {progress.completedLessons > 0 ? 'Continue Course' : 'Start Course'} →
                  </Button>
                ) : (
                  <Button variant="secondary" size="lg" fullWidth disabled>
                    Curriculum Planned
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Module & Lesson Syllabus Breakdown */}
          {course.modules && course.modules.length > 0 && (
            <div>
              <h2 style={{ fontSize: '1.5rem', color: '#f0f6fc', marginBottom: '1.5rem' }}>
                Course Syllabus ({course.modules.length} Modules)
              </h2>

              <div className={styles.modulesList}>
                {course.modules.map((mod, modIdx) => (
                  <div key={mod.id || modIdx} className={styles.moduleCard}>
                    <div className={styles.moduleHeader}>
                      <div>
                        <h3 className={styles.moduleTitle}>
                          Module {modIdx + 1}: {mod.title}
                        </h3>
                        <p className={styles.moduleDesc}>{mod.description}</p>
                      </div>
                      <Badge variant="neutral" size="sm">
                        {mod.lessons?.length || 0} Lessons
                      </Badge>
                    </div>

                    <div className={styles.lessonTable}>
                      {(mod.lessons || []).map((l) => {
                        const isDone = progress.completedLessonSlugs?.includes(l.slug);

                        return (
                          <Link
                            key={l.slug}
                            href={`/learn/${course.slug}/${l.slug}`}
                            className={styles.lessonRow}
                          >
                            <div className={styles.lessonLeft}>
                              <span
                                className={`${styles.lessonStatus} ${
                                  isDone ? styles.lessonStatusCompleted : ''
                                }`}
                              >
                                {isDone ? '✓' : '○'}
                              </span>
                              <span className={styles.lessonTitle}>{l.title}</span>
                            </div>
                            <div className={styles.lessonRight}>
                              {l.estimatedMinutes && (
                                <span className={styles.lessonDuration}>
                                  ⏱ {l.estimatedMinutes} mins
                                </span>
                              )}
                              <Badge variant="neutral" size="sm">
                                View →
                              </Badge>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Container>
      </Section>
    </div>
  );
}
