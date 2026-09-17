'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './LessonCompleteButton.module.css';

/**
 * LessonCompleteButton Component
 * Allows authenticated users to mark a lesson as completed, and prompts guests to sign in.
 *
 * @param {Object} props
 * @param {string} props.lessonSlug - Current lesson slug
 * @param {boolean} [props.initialCompleted=false] - Current completion state
 * @param {string} [props.nextLessonUrl] - Optional URL of the next lesson to navigate to
 */
export default function LessonCompleteButton({
  lessonSlug,
  initialCompleted = false,
  nextLessonUrl,
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [completed, setCompleted] = useState(initialCompleted);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const toggleComplete = async () => {
    if (!session?.user) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonSlug,
          completed: !completed,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update progress.');
      }

      const data = await res.json();
      setCompleted(data.isCompleted);
      router.refresh();

      // If just completed and next lesson exists, smoothly navigate after brief confirmation
      if (data.isCompleted && nextLessonUrl) {
        setTimeout(() => {
          router.push(nextLessonUrl);
        }, 1200);
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // If user is not authenticated (guest)
  if (status !== 'loading' && !session) {
    return (
      <div className={styles.wrap}>
        <div className={styles.guestPrompt}>
          Want to track your learning progress?
          <Link href={`/login?callbackUrl=/learn`} className={styles.guestLink}>
            Sign in to save completion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        onClick={toggleComplete}
        disabled={loading}
        className={`${styles.button} ${
          completed ? styles.buttonCompleted : styles.buttonMarkComplete
        } ${loading ? styles.buttonPending : ''}`}
      >
        {loading ? (
          'Updating...'
        ) : completed ? (
          '✓ Completed (Click to undo)'
        ) : (
          'Mark as Completed & Continue'
        )}
      </button>
      {errorMsg ? <span className={styles.errorText}>{errorMsg}</span> : null}
    </div>
  );
}
