import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import CodeBlock from '@/components/ui/CodeBlock';
import TerminalVisual from '@/components/ui/TerminalVisual';
import KnowledgeCheck from '@/components/ui/KnowledgeCheck';
import LessonSidebar from '@/components/ui/LessonSidebar';
import LessonCompleteButton from '@/components/ui/LessonCompleteButton';
import { contentService } from '@/services/contentService';
import { getUserCourseProgress } from '@/lib/db/learning';
import styles from './lesson.module.css';

export async function generateMetadata({ params }) {
  const lesson = await contentService.getLessonBySlug(params.lessonSlug, params.courseSlug);
  if (!lesson) return { title: 'Lesson Not Found — BPFQuest' };
  return {
    title: `${lesson.title} — BPFQuest`,
    description: lesson.description,
  };
}

export default async function LessonPage({ params }) {
  const { courseSlug, lessonSlug } = params;
  const course = await contentService.getCourseBySlug(courseSlug);
  const lesson = await contentService.getLessonBySlug(lessonSlug, courseSlug);

  if (!course || !lesson) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  let progress = {
    totalLessons: 0,
    completedLessons: 0,
    percentage: 0,
    completedLessonSlugs: [],
  };

  if (session?.user?.id) {
    progress = await getUserCourseProgress(session.user.id, courseSlug);
  } else if (course.modules) {
    progress.totalLessons = course.modules.reduce(
      (acc, m) => acc + (m.lessons?.length || 0),
      0
    );
  }

  const isCompleted = progress.completedLessonSlugs.includes(lessonSlug);
  const { prev, next } = await contentService.getNextAndPrevLessons(courseSlug, lessonSlug);
  const nextLessonUrl = next ? `/learn/${courseSlug}/${next.slug}` : `/learn/${courseSlug}`;

  return (
    <div className={styles.page}>
      <PageHeader
        title={lesson.title}
        description={lesson.description}
        badgeText={lesson.difficulty}
        badgeVariant={
          lesson.difficulty === 'BEGINNER'
            ? 'emerald'
            : lesson.difficulty === 'INTERMEDIATE'
            ? 'orange'
            : 'purple'
        }
        breadcrumbs={[
          { title: 'Home', href: '/' },
          { title: 'Learn', href: '/learn' },
          { title: course.title, href: `/learn/${course.slug}` },
          { title: lesson.title },
        ]}
      />

      <Section spacing="lg">
        <Container>
          <div className={styles.layoutGrid}>
            {/* Main Content Body */}
            <article className={styles.mainArticle}>
              {/* Meta strip */}
              <div className={styles.metaStrip}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Estimated Duration:</span>
                  <span className={styles.metaValue}>
                    ⏱ {lesson.estimatedMinutes || 15} minutes
                  </span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Status:</span>
                  {isCompleted ? (
                    <Badge variant="emerald" size="sm">✓ Completed</Badge>
                  ) : (
                    <Badge variant="cyan" size="sm">In Progress</Badge>
                  )}
                </div>
              </div>

              {/* Prerequisites & Objectives */}
              <div className={styles.prepGrid}>
                {lesson.prerequisites?.length > 0 && (
                  <Card variant="bordered" className={styles.prepCard}>
                    <h3 className={styles.prepHeading}>Prerequisites</h3>
                    <ul className={styles.prepList}>
                      {lesson.prerequisites.map((req, idx) => (
                        <li key={idx}>✓ {req}</li>
                      ))}
                    </ul>
                  </Card>
                )}

                {lesson.objectives?.length > 0 && (
                  <Card variant="bordered" className={styles.prepCard}>
                    <h3 className={styles.prepHeading}>Learning Objectives</h3>
                    <ul className={styles.prepList}>
                      {lesson.objectives.map((obj, idx) => (
                        <li key={idx}>🎯 {obj}</li>
                      ))}
                    </ul>
                  </Card>
                )}
              </div>

              {/* Lesson Text Content */}
              <div className={styles.contentBody}>
                {lesson.content
                  .trim()
                  .split('\n\n')
                  .map((block, idx) => {
                    if (block.startsWith('### ')) {
                      return (
                        <h3 key={idx} className={styles.subHeading}>
                          {block.replace('### ', '')}
                        </h3>
                      );
                    }
                    if (block.startsWith('#### ')) {
                      return (
                        <h4 key={idx} style={{ color: '#58a6ff', margin: '0.75rem 0 0.25rem 0' }}>
                          {block.replace('#### ', '')}
                        </h4>
                      );
                    }
                    if (block.startsWith('---')) {
                      return <hr key={idx} style={{ borderColor: 'var(--border-subtle)', margin: '1rem 0' }} />;
                    }
                    if (block.startsWith('- ') || block.startsWith('* ')) {
                      const items = block
                        .split('\n')
                        .map((li) => li.replace(/^[-*]\s+/, ''));
                      return (
                        <ul key={idx} className={styles.bulletList}>
                          {items.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      );
                    }
                    return (
                      <p key={idx} className={styles.paragraph}>
                        {block}
                      </p>
                    );
                  })}
              </div>

              {/* Real Linux Terminal Demonstrations */}
              {lesson.terminalCommands?.length > 0 && (
                <div className={styles.examplesSection}>
                  <h3 className={styles.sectionTitle}>Terminal Commands & Inspection</h3>
                  {lesson.terminalCommands.map((item, idx) => (
                    <TerminalVisual
                      key={idx}
                      title={item.title || 'bash'}
                      command={item.command}
                      output={item.output}
                    />
                  ))}
                </div>
              )}

              {/* Code Demonstrations */}
              {lesson.codeExamples?.length > 0 && (
                <div className={styles.examplesSection}>
                  <h3 className={styles.sectionTitle}>Code Demonstrations</h3>
                  <div className={styles.examplesList}>
                    {lesson.codeExamples.map((example, idx) => (
                      <div key={idx} className={styles.exampleItem}>
                        <CodeBlock
                          code={example.code}
                          language={example.language}
                          title={example.title}
                          showLineNumbers={true}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Knowledge Check */}
              {lesson.knowledgeCheck && (
                <KnowledgeCheck check={lesson.knowledgeCheck} />
              )}

              {/* Hints */}
              {lesson.hints?.length > 0 && (
                <div className={styles.hintsSection}>
                  <h4 className={styles.hintsTitle}>💡 Kernel Hints</h4>
                  <ul className={styles.hintsList}>
                    {lesson.hints.map((hint, idx) => (
                      <li key={idx} className={styles.hintItem}>
                        {hint}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Connected Mission Challenge Callout (Section 20) */}
              {(lessonSlug === 'what-is-a-process' ||
                lessonSlug === 'process-inspection' ||
                lessonSlug === 'file-descriptors' ||
                lessonSlug === 'network-interfaces' ||
                lessonSlug === 'basic-linux-networking-tools') && (
                <div
                  style={{
                    background: 'linear-gradient(180deg, #161b22 0%, #0d1117 100%)',
                    border: '1px solid rgba(249, 115, 22, 0.4)',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    marginTop: '1.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                    <Badge variant="orange" size="sm">HANDS-ON PRACTICE</Badge>
                    <span style={{ fontSize: '0.85rem', color: '#8b949e' }}>Ready to practice?</span>
                  </div>
                  <h4 style={{ color: '#f0f6fc', fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>
                    Put your systems knowledge to work in a real investigation scenario.
                  </h4>
                  <p style={{ color: '#c9d1d9', fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
                    {lessonSlug === 'what-is-a-process' || lessonSlug === 'process-inspection'
                      ? 'Launch Mission: Observe a Process — Inspect an active background daemon and verify its PID/PPID hierarchy in /proc.'
                      : lessonSlug === 'file-descriptors'
                      ? 'Launch Mission: Explore File Descriptors — Trace open handles in /proc/<pid>/fd to resolve an EMFILE leak.'
                      : 'Launch Mission: Find a Network Interface — Diagnose operational link states and MTU configuration.'}
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    href={
                      lessonSlug === 'what-is-a-process' || lessonSlug === 'process-inspection'
                        ? '/missions/observe-a-process'
                        : lessonSlug === 'file-descriptors'
                        ? '/missions/explore-file-descriptors'
                        : '/missions/find-a-network-interface'
                    }
                  >
                    Start Related Mission →
                  </Button>
                </div>
              )}

              {/* Try It Yourself: Interactive Playground Callout (Section 20) */}
              <div
                style={{
                  background: 'rgba(0, 242, 254, 0.04)',
                  border: '1px solid rgba(0, 242, 254, 0.2)',
                  borderRadius: '8px',
                  padding: '1.25rem',
                  marginTop: '1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <Badge variant="cyan" size="sm">INTERACTIVE PLAYGROUND</Badge>
                    <span style={{ fontSize: '0.85rem', color: '#f0f6fc', fontWeight: 600 }}>
                      Try it yourself in code
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#8b949e' }}>
                    Explore hands-on eBPF and kernel C examples directly in the browser editor.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  href={
                    lessonSlug === 'file-descriptors'
                      ? '/playground/file-open'
                      : lessonSlug === 'what-is-a-process' || lessonSlug === 'process-inspection'
                      ? '/playground/trace-process'
                      : lessonSlug === 'network-interfaces' || lessonSlug === 'tcp-and-udp'
                      ? '/playground/network-events'
                      : '/playground/hello-ebpf'
                  }
                >
                  Open Playground →
                </Button>
              </div>

              {/* Lesson Completion Action */}
              <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                <LessonCompleteButton
                  lessonSlug={lessonSlug}
                  initialCompleted={isCompleted}
                  nextLessonUrl={nextLessonUrl}
                />
              </div>

              {/* Previous & Next Lesson Navigation */}
              <div className={styles.lessonNavigation}>
                {prev ? (
                  <Button
                    variant="secondary"
                    href={`/learn/${courseSlug}/${prev.slug}`}
                  >
                    ← Previous: {prev.title}
                  </Button>
                ) : (
                  <Button variant="secondary" href={`/learn/${courseSlug}`}>
                    ← Course Syllabus
                  </Button>
                )}

                {next ? (
                  <Button
                    variant="primary"
                    href={`/learn/${courseSlug}/${next.slug}`}
                  >
                    Next: {next.title} →
                  </Button>
                ) : (
                  <Button variant="primary" href={`/learn/${courseSlug}`}>
                    Finish Course →
                  </Button>
                )}
              </div>
            </article>

            {/* Sidebar with dynamic Module tree & Lesson Progress */}
            <aside className={styles.sidebar}>
              <LessonSidebar
                course={course}
                currentLessonSlug={lessonSlug}
                completedSlugs={progress.completedLessonSlugs}
                completedCount={progress.completedLessons}
                totalCount={progress.totalLessons}
              />

              {lesson.resources?.length > 0 && (
                <Card variant="bordered" className={styles.sidebarCard}>
                  <h4 className={styles.sidebarHeading}>External Documentation</h4>
                  <ul className={styles.resourceList}>
                    {lesson.resources.map((res, idx) => (
                      <li key={idx}>
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.resourceLink}
                        >
                          <span>{res.title}</span>
                          <span className={styles.extIcon}>↗</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </aside>
          </div>
        </Container>
      </Section>
    </div>
  );
}
