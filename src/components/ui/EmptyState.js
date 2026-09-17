import React from 'react';
import styles from './EmptyState.module.css';
import Button from './Button';
import { cn } from '@/lib/utils/cn';

/**
 * EmptyState component for clean, honest empty data views
 */
export default function EmptyState({
  icon = '📜',
  title = 'No data available',
  description = 'There are currently no items to display.',
  actionLabel,
  actionHref,
  onAction,
  className = '',
}) {
  return (
    <div className={cn(styles.wrapper, className)}>
      <div className={styles.icon} aria-hidden="true">{icon}</div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {(actionLabel && (actionHref || onAction)) && (
        <div className={styles.action}>
          <Button
            variant="primary"
            size="sm"
            href={actionHref}
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
