'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Badge from '@/components/ui/Badge';
import styles from './MissionWorkspace.module.css';

/**
 * MissionWorkspace
 * Simulated challenge interaction interface. Handles mission start and solution submission.
 *
 * @param {Object} props
 * @param {string} props.missionSlug
 * @param {Object} props.userStatus - Initial status { status: 'NOT_STARTED'|'IN_PROGRESS'|'COMPLETED' }
 * @param {boolean} props.isAuthenticated
 * @param {Function} [props.onStatusChange]
 */
export default function MissionWorkspace({
  missionSlug,
  userStatus = { status: 'NOT_STARTED' },
  isAuthenticated = false,
}) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(userStatus.status || 'NOT_STARTED');
  const [solutionInput, setSolutionInput] = useState('');
  const [inspectionConfirmed, setInspectionConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // 1. Start Mission
  const handleStartMission = async () => {
    if (!isAuthenticated) {
      router.push(`/login?callbackUrl=/missions/${missionSlug}`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/missions/${missionSlug}/start`, {
        method: 'POST',
      });

      if (res.ok) {
        setCurrentStatus('IN_PROGRESS');
        router.refresh();
      }
    } catch (err) {
      console.error('Failed to start mission:', err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Submit Solution
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/missions/${missionSlug}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          solutionText: solutionInput,
          inspectionConfirmed,
        }),
      });

      const data = await res.json();
      setFeedback(data);

      if (data.passed) {
        setCurrentStatus('COMPLETED');
        router.refresh();
      }
    } catch (err) {
      setFeedback({
        passed: false,
        status: 'ERROR',
        feedback: 'Network or server error while validating submission.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.workspace} aria-label="Mission Workspace">
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <h3 className={styles.title}>Mission Workspace</h3>
          <Badge
            variant={
              currentStatus === 'COMPLETED'
                ? 'emerald'
                : currentStatus === 'IN_PROGRESS'
                ? 'cyan'
                : 'neutral'
            }
            size="sm"
          >
            {currentStatus === 'COMPLETED'
              ? '✓ COMPLETED'
              : currentStatus === 'IN_PROGRESS'
              ? 'IN PROGRESS'
              : 'NOT STARTED'}
          </Badge>
        </div>
      </div>

      <div className={styles.envNotice}>
        <span>
          <span className={styles.envBadge}>ENVIRONMENT:</span> Simulated Linux 6.8
          Sandbox (Mock Environment)
        </span>
        <span>Stage 7 MicroVM Lab Runner Coming Soon</span>
      </div>

      <div className={styles.body}>
        {/* Unauthenticated view */}
        {!isAuthenticated && (
          <div className={styles.guestPrompt}>
            <p style={{ margin: 0, color: '#c9d1d9', fontSize: '0.95rem' }}>
              Sign in to launch the workspace and track your mission attempts.
            </p>
            <Link
              href={`/login?callbackUrl=/missions/${missionSlug}`}
              className={styles.signInLink}
            >
              Sign In to Start Mission
            </Link>
          </div>
        )}

        {/* Authenticated NOT_STARTED */}
        {isAuthenticated && currentStatus === 'NOT_STARTED' && (
          <div className={styles.stateBox}>
            <p className={styles.stateText}>
              Ready to investigate? Click below to begin your mission attempt and unlock the solution submission interface.
            </p>
            <button
              type="button"
              onClick={handleStartMission}
              disabled={loading}
              className={styles.startBtn}
            >
              {loading ? 'Starting...' : 'Start Mission'}
            </button>
          </div>
        )}

        {/* IN_PROGRESS or COMPLETED */}
        {isAuthenticated && currentStatus !== 'NOT_STARTED' && (
          <form onSubmit={handleSubmit} className={styles.solutionForm}>
            <div className={styles.inputGroup}>
              <label htmlFor="solution-input" className={styles.inputLabel}>
                Target Finding / Solution Parameter:
              </label>
              <input
                id="solution-input"
                type="text"
                value={solutionInput}
                onChange={(e) => setSolutionInput(e.target.value)}
                placeholder="e.g. process name, PID, or file path..."
                className={styles.textInput}
                disabled={loading}
              />
            </div>

            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={inspectionConfirmed}
                onChange={(e) => setInspectionConfirmed(e.target.checked)}
                className={styles.checkbox}
                disabled={loading}
              />
              <span>
                I have investigated the system indicators and verified the mission objectives.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading || (!solutionInput.trim() && !inspectionConfirmed)}
              className={styles.submitBtn}
            >
              {loading ? 'Validating...' : 'Submit Solution'}
            </button>
          </form>
        )}

        {/* Feedback Display */}
        {feedback && (
          <div
            className={`${styles.feedbackBox} ${
              feedback.passed ? styles.feedbackSuccess : styles.feedbackFailed
            }`}
            role="alert"
          >
            <div className={styles.feedbackHeading}>
              {feedback.passed ? '✓ Mission Complete!' : '✗ Validation Failed'}
            </div>
            <p className={styles.feedbackMsg}>{feedback.feedback}</p>
          </div>
        )}

        {/* Already completed banner */}
        {currentStatus === 'COMPLETED' && !feedback && (
          <div className={`${styles.feedbackBox} ${styles.feedbackSuccess}`}>
            <div className={styles.feedbackHeading}>✓ Mission Complete</div>
            <p className={styles.feedbackMsg}>
              You have previously solved this mission. You can submit another solution to test alternative hypotheses.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
