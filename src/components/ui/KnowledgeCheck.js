'use client';

import React, { useState } from 'react';
import styles from './KnowledgeCheck.module.css';

/**
 * KnowledgeCheck Component
 * Renders an interactive quiz question with instant educational feedback.
 *
 * @param {Object} props
 * @param {Object} props.check - Knowledge check object
 * @param {string} [props.check.title] - Title
 * @param {string} props.check.prompt - Question prompt
 * @param {Array<string>} props.check.options - Array of choices
 * @param {number|number[]} props.check.correctAnswer - Index of correct option (or array of indices)
 * @param {string} props.check.explanation - Educational explanation for why the answer is correct
 * @param {Function} [props.onPass] - Callback fired when question is answered correctly
 */
export default function KnowledgeCheck({ check, onPass }) {
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  if (!check || !check.options || check.options.length === 0) {
    return null;
  }

  const isCorrect = submitted && selectedIdx === check.correctAnswer;
  const isWrong = submitted && selectedIdx !== check.correctAnswer;

  const handleSubmit = () => {
    if (selectedIdx === null) return;
    setSubmitted(true);
    if (selectedIdx === check.correctAnswer && typeof onPass === 'function') {
      onPass();
    }
  };

  const handleReset = () => {
    setSelectedIdx(null);
    setSubmitted(false);
  };

  return (
    <section className={styles.container} aria-labelledby="kc-title">
      <div className={styles.header}>
        <h3 id="kc-title" className={styles.title}>
          {check.title || 'Knowledge Check'}
        </h3>
        <span className={styles.badge}>Interactive Check</span>
      </div>

      <p className={styles.prompt}>{check.prompt}</p>

      <div className={styles.optionsList} role="radiogroup" aria-label="Question choices">
        {check.options.map((option, idx) => {
          let itemStyle = styles.optionItem;
          if (selectedIdx === idx) {
            itemStyle += ` ${styles.optionSelected}`;
          }
          if (submitted) {
            if (idx === check.correctAnswer) {
              itemStyle += ` ${styles.optionCorrect}`;
            } else if (selectedIdx === idx) {
              itemStyle += ` ${styles.optionWrong}`;
            }
          }

          return (
            <label
              key={idx}
              className={itemStyle}
              onClick={() => !submitted && setSelectedIdx(idx)}
            >
              <input
                type="radio"
                name="knowledge-check"
                value={idx}
                checked={selectedIdx === idx}
                onChange={() => !submitted && setSelectedIdx(idx)}
                disabled={submitted}
                className={styles.radioInput}
              />
              <span className={styles.optionText}>{option}</span>
            </label>
          );
        })}
      </div>

      <div className={styles.actionRow}>
        {!submitted ? (
          <button
            type="button"
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={selectedIdx === null}
          >
            Submit Answer
          </button>
        ) : (
          <button
            type="button"
            className={styles.resetBtn}
            onClick={handleReset}
          >
            Try Again
          </button>
        )}
      </div>

      {submitted && (
        <div
          className={`${styles.feedbackBox} ${
            isCorrect ? styles.feedbackCorrect : styles.feedbackWrong
          }`}
          role="alert"
        >
          <div className={styles.feedbackTitle}>
            {isCorrect ? '✓ Correct Answer!' : '✗ Not Quite Right'}
          </div>
          <p className={styles.explanation}>{check.explanation}</p>
        </div>
      )}
    </section>
  );
}
