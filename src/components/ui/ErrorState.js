import React from 'react';
import styles from './ErrorState.module.css';
import Button from './Button';
import { cn } from '@/lib/utils/cn';

/**
 * ErrorState component for displaying safe error messages
 */
export default function ErrorState({
  title = 'An error occurred',
  message = 'Unable to complete the requested action. Please try again.',
  retryLabel,
  onRetry,
  className = '',
}) {
  return (
    <div className={cn(styles.wrapper, className)} role="alert">
      <div className={styles.icon} aria-hidden="true">⚠️</div>
      <div className={styles.content}>
        <h4 className={styles.title}>{title}</h4>
        <p className={styles.message}>{message}</p>
      </div>
      {retryLabel && onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
