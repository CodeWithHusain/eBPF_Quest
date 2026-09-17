import React from 'react';
import styles from './ProgressBar.module.css';
import { cn } from '@/lib/utils/cn';

/**
 * Accessible ProgressBar component.
 * 
 * @param {Object} props
 * @param {number} props.value - Current progress (0 to 100)
 * @param {number} [props.max=100] - Max value
 * @param {string} [props.label] - Label describing the progress
 * @param {boolean} [props.showPercentage=false]
 * @param {'cyan'|'orange'|'emerald'|'purple'} [props.variant='cyan']
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {string} [props.className]
 */
export default function ProgressBar({
  value = 0,
  max = 100,
  label,
  showPercentage = false,
  variant = 'cyan',
  size = 'md',
  className = '',
}) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  return (
    <div className={cn(styles.wrapper, className)}>
      {(label || showPercentage) && (
        <div className={styles.header}>
          {label && <span className={styles.label}>{label}</span>}
          {showPercentage && <span className={styles.percentage}>{percentage}%</span>}
        </div>
      )}
      <div
        className={cn(styles.track, styles[size])}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
      >
        <div
          className={cn(styles.fill, styles[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
