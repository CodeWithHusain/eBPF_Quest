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
import { contentService } from '@/services/contentService';
import { getUserCourseProgress } from '@/lib/db/learning';
import styles from './learn.module.css';

export const metadata = {
  title: 'Curriculum & Courses — BPFQuest',
  description: 'Structured Linux internals and eBPF kernel programming courses.',
};

export default async function LearnPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  const courses = await contentService.getCourses();

  // Active filter tab
  const filter = searchParams?.filter || 'all';

  // Compute real progress for available courses if user is authenticated
  const coursesWithProgress = await Promise.all(
    courses.map(async (course) => {
      let progress = {
        totalLessons: course.lessonsCount || 0,
        completedLessons: 0,
        percentage: 0,
      };

      if (course.isPublished && course.modules) {
        const total = course.modules.reduce(
          (acc, m) => acc + (m.lessons?.length || 0),
          0
        );
        progress.totalLessons = total;

        if (session?.user?.id) {
          const dbProg = await getUserCourseProgress(session.user.id, course.slug);
          progress.completedLessons = dbProg.completedLessons;
          progress.percentage = dbProg.percentage;
        }
      }

      return {
        ...course,
        progress,
      };
    })
  );

  // Filter logic
  const filteredCourses = coursesWithProgress.filter((c) => {
    if (filter === 'all') return true;
    if (filter === 'beginner') return c.difficulty === 'BEGINNER';
    if (filter === 'intermediate') return c.difficulty === 'INTERMEDIATE';
    if (filter === 'advanced') return c.difficulty === 'ADVANCED';
    if (filter === 'available') return c.isPublished;
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Curriculum Tracks"
        description="From Linux OS foundations to high-throughput in-kernel eBPF packet processing."
        badgeText="8 COURSES"
        badgeVariant="cyan"
        breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Learn' }]}
      />

      <Section spacing="lg">
        <Container>
          {/* Filter Bar */}
          <div className={styles.filterBar}>
            <Link
              href="/learn"
              className={`${styles.filterBtn} ${
                filter === 'all' ? styles.filterBtnActive : ''
              }`}
            >
              All Courses
            </Link>
            <Link
              href="/learn?filter=available"
              className={`${styles.filterBtn} ${
                filter === 'available' ? styles.filterBtnActive : ''
              }`}
            >
              Available Now
            </Link>
            <Link
              href="/learn?filter=beginner"
              className={`${styles.filterBtn} ${
                filter === 'beginner' ? styles.filterBtnActive : ''
              }`}
            >
              Beginner
            </Link>
            <Link
              href="/learn?filter=intermediate"
              className={`${styles.filterBtn} ${
                filter === 'intermediate' ? styles.filterBtnActive : ''
              }`}
            >
              Intermediate
            </Link>
            <Link
              href="/learn?filter=advanced"
              className={`${styles.filterBtn} ${
                filter === 'advanced' ? styles.filterBtnActive : ''
              }`}
            >
              Advanced
            </Link>
          </div>

          <div className={styles.coursesGrid}>
            {filteredCourses.map((course) => {
              const isAvailable = course.isPublished;
              const { totalLessons, completedLessons, percentage } = course.progress;

              return (
                <Card
                  key={course.slug}
                  variant={isAvailable ? 'interactive' : 'bordered'}
                  className={`${styles.courseCard} ${
                    isAvailable ? styles.availableCourse : styles.plannedCourse
                  }`}
                >
                  <div className={styles.courseHeader}>
                    <div className={styles.badgeRow}>
                      <Badge
                        variant={
                          course.difficulty === 'BEGINNER'
                            ? 'emerald'
                            : course.difficulty === 'INTERMEDIATE'
                            ? 'orange'
                            : 'purple'
                        }
                        size="sm"
                      >
                        {course.difficulty}
                      </Badge>
                      {isAvailable ? (
                        <Badge variant="cyan" size="sm">
                          Available
                        </Badge>
                      ) : (
                        <Badge variant="locked" size="sm">
                          Coming Soon
                        </Badge>
                      )}
                    </div>
                    <span className={styles.lessonMeta}>
                      ⏱ {course.estimatedHours ? `${course.estimatedHours} hrs` : course.estimatedTime} •{' '}
                      {totalLessons} lessons
                    </span>
                  </div>

                  <h3 className={styles.courseTitle}>{course.title}</h3>
                  <p className={styles.courseDesc}>
                    {course.shortDescription || course.description}
                  </p>

                  {/* Real Progress Bar for Available Courses */}
                  {isAvailable && (
                    <div className={styles.progressContainer}>
                      <div className={styles.progressText}>
                        <span>
                          {session?.user
                            ? `${completedLessons} of ${totalLessons} completed`
                            : `${totalLessons} lessons`}
                        </span>
                        {session?.user && <span>{percentage}%</span>}
                      </div>
                      {session?.user && (
                        <div className={styles.progressBar}>
                          <div
                            className={styles.progressFill}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <div className={styles.cardAction}>
                    {isAvailable ? (
                      <div className={styles.actionButtonRow}>
                        <Button
                          variant="secondary"
                          size="md"
                          href={`/learn/${course.slug}`}
                        >
                          Syllabus
                        </Button>
                        <Button
                          variant="primary"
                          size="md"
                          href={`/learn/${course.slug}/what-is-linux`}
                        >
                          {completedLessons > 0 ? 'Continue' : 'Start'} →
                        </Button>
                      </div>
                    ) : (
                      <Button variant="secondary" size="md" fullWidth disabled>
                        Coming Soon
                      </Button>
                    )}
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
