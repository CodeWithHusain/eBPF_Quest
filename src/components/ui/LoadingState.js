import React from 'react';
import styles from './LoadingState.module.css';
import { cn } from '@/lib/utils/cn';

/**
 * LoadingState spinner and message component
 */
export default function LoadingState({
  message = 'Loading...',
  size = 'md',
  className = '',
}) {
  return (
    <div className={cn(styles.wrapper, styles[size], className)} role="status" aria-live="polite">
      <div className={styles.spinner} aria-hidden="true" />
      <span className={styles.message}>{message}</span>
    </div>
  );
}
