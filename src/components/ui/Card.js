import React from 'react';
import styles from './Card.module.css';
import { cn } from '@/lib/utils/cn';

/**
 * Card container component with optional hover elevation, header, and footer.
 * 
 * @param {Object} props
 * @param {'default'|'interactive'|'terminal'|'bordered'} [props.variant='default']
 * @param {'none'|'sm'|'md'|'lg'} [props.padding='md']
 * @param {React.ReactNode} [props.header]
 * @param {React.ReactNode} [props.footer]
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export default function Card({
  variant = 'default',
  padding = 'md',
  header,
  footer,
  className = '',
  children,
  ...props
}) {
  return (
    <div
      className={cn(styles.card, styles[variant], styles[`p-${padding}`], className)}
      {...props}
    >
      {header && <div className={styles.header}>{header}</div>}
      <div className={styles.body}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
}
