import React from 'react';
import Link from 'next/link';
import styles from './LessonSidebar.module.css';

/**
 * LessonSidebar Component
 * Renders the course curriculum tree grouped by modules with active and completion indicators.
 *
 * @param {Object} props
 * @param {Object} props.course - Course object with title, slug, and modules array
 * @param {string} props.currentLessonSlug - Current active lesson slug
 * @param {Array<string>} [props.completedSlugs=[]] - Slugs of lessons completed by user
 * @param {number} [props.completedCount=0]
 * @param {number} [props.totalCount=0]
 */
export default function LessonSidebar({
  course,
  currentLessonSlug,
  completedSlugs = [],
  completedCount = 0,
  totalCount = 0,
}) {
  if (!course || !course.modules) {
    return null;
  }

  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <aside className={styles.sidebar} aria-label="Course curriculum">
      <div className={styles.header}>
        <div className={styles.courseTitle}>{course.title}</div>
        <div className={styles.progressWrap}>
          <div className={styles.progressMeta}>
            <span>{completedCount} of {totalCount} completed</span>
            <span>{percentage}%</span>
          </div>
          <div className={styles.progressBarBg}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${percentage}%` }}
              role="progressbar"
              aria-valuenow={percentage}
              aria-valuemin="0"
              aria-valuemax="100"
            />
          </div>
        </div>
      </div>

      <div className={styles.modulesList}>
        {course.modules.map((module, modIdx) => (
          <div key={module.id || modIdx} className={styles.moduleSection}>
            <div className={styles.moduleHeader}>
              <span>{module.title}</span>
              <span>{module.lessons?.length || 0}</span>
            </div>

            <ul className={styles.lessonList}>
              {(module.lessons || []).map((lesson) => {
                const isActive = lesson.slug === currentLessonSlug;
                const isCompleted = completedSlugs.includes(lesson.slug);

                return (
                  <li key={lesson.slug} className={styles.lessonItem}>
                    <Link
                      href={`/learn/${course.slug}/${lesson.slug}`}
                      className={`${styles.lessonLink} ${
                        isActive ? styles.lessonActive : ''
                      }`}
                    >
                      <span className={styles.lessonName}>
                        <span
                          className={`${styles.statusIcon} ${
                            isCompleted
                              ? styles.completedIcon
                              : styles.uncompletedIcon
                          }`}
                        >
                          {isCompleted ? '✓' : '○'}
                        </span>
                        <span>{lesson.title}</span>
                      </span>
                      {lesson.estimatedMinutes ? (
                        <span className={styles.timeEstimate}>
                          {lesson.estimatedMinutes}m
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}
