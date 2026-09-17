import React from 'react';
import styles from './MissionObjectivesList.module.css';

/**
 * MissionObjectivesList
 * Displays structured challenge goals with pass/pending status indicators.
 *
 * @param {Object} props
 * @param {Array} props.objectives - Array of objective items
 * @param {Array<string>} [props.passedKeys=[]] - List of validationKeys currently passed
 */
export default function MissionObjectivesList({ objectives = [], passedKeys = [] }) {
  if (!objectives || objectives.length === 0) return null;

  return (
    <div className={styles.container}>
      {objectives.map((obj, idx) => {
        const isPassed = passedKeys.includes(obj.validationKey);

        return (
          <div
            key={obj.id || idx}
            className={`${styles.item} ${isPassed ? styles.itemPassed : ''}`}
          >
            <div
              className={`${styles.iconBox} ${
                isPassed ? styles.iconPassed : styles.iconPending
              }`}
              aria-label={isPassed ? 'Objective passed' : 'Objective pending'}
            >
              {isPassed ? '✓' : idx + 1}
            </div>
            <div className={styles.content}>
              <div className={styles.title}>{obj.title}</div>
              {obj.description && (
                <div className={styles.desc}>{obj.description}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
