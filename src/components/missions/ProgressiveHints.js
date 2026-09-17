'use client';

import React, { useState } from 'react';
import styles from './ProgressiveHints.module.css';

/**
 * ProgressiveHints
 * Renders hints that can be expanded on demand without revealing everything up front.
 *
 * @param {Object} props
 * @param {Array} props.hints - Array of hint items { id, title, content }
 */
export default function ProgressiveHints({ hints = [] }) {
  const [revealed, setRevealed] = useState({});

  if (!hints || hints.length === 0) return null;

  const toggleHint = (idx) => {
    setRevealed((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  return (
    <div className={styles.container}>
      {hints.map((hint, idx) => {
        const isRevealed = Boolean(revealed[idx]);

        return (
          <div key={hint.id || idx} className={styles.hintCard}>
            <div
              className={styles.header}
              onClick={() => toggleHint(idx)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleHint(idx);
                }
              }}
              aria-expanded={isRevealed}
            >
              <div className={styles.hintTitle}>
                <span>{isRevealed ? '💡' : '🔒'}</span>
                <span>
                  Hint {idx + 1}: {hint.title}
                </span>
              </div>
              <button
                type="button"
                className={styles.revealBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleHint(idx);
                }}
              >
                {isRevealed ? 'Hide' : 'Reveal Hint'}
              </button>
            </div>

            {isRevealed && (
              <div className={styles.content}>
                <p style={{ margin: 0 }}>{hint.content}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
