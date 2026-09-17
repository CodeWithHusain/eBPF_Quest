import React from 'react';
import styles from './Container.module.css';
import { cn } from '@/lib/utils/cn';

/**
 * Container component to constrain content width and provide responsive padding.
 * 
 * @param {Object} props
 * @param {'default'|'narrow'|'wide'|'full'} [props.size='default']
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export default function Container({
  size = 'default',
  className = '',
  children,
  ...props
}) {
  return (
    <div
      className={cn(styles.container, styles[size], className)}
      {...props}
    >
      {children}
    </div>
  );
}
