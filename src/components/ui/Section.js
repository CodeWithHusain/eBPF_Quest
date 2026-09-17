import React from 'react';
import styles from './Section.module.css';
import { cn } from '@/lib/utils/cn';

/**
 * Section component for structuring landing page and layout sections with consistent vertical rhythm.
 * 
 * @param {Object} props
 * @param {'none'|'sm'|'md'|'lg'|'xl'} [props.spacing='lg']
 * @param {'transparent'|'primary'|'secondary'|'canvas'} [props.background='transparent']
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export default function Section({
  spacing = 'lg',
  background = 'transparent',
  className = '',
  children,
  ...props
}) {
  return (
    <section
      className={cn(styles.section, styles[spacing], styles[background], className)}
      {...props}
    >
      {children}
    </section>
  );
}
