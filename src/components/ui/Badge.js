import React from 'react';
import styles from './Badge.module.css';
import { cn } from '@/lib/utils/cn';

/**
 * Status and category Badge component.
 * 
 * @param {Object} props
 * @param {'default'|'cyan'|'emerald'|'orange'|'purple'|'locked'|'outline'} [props.variant='default']
 * @param {'sm'|'md'} [props.size='sm']
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export default function Badge({
  variant = 'default',
  size = 'sm',
  className = '',
  children,
  ...props
}) {
  return (
    <span
      className={cn(styles.badge, styles[variant], styles[size], className)}
      {...props}
    >
      {children}
    </span>
  );
}
