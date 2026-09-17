import React from 'react';
import Link from 'next/link';
import styles from './Button.module.css';
import { cn } from '@/lib/utils/cn';

/**
 * Reusable Button component supporting button tags and Next.js Links.
 * 
 * @param {Object} props
 * @param {'primary'|'secondary'|'outline'|'ghost'|'terminal'} [props.variant='primary']
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {string} [props.href] - If provided, renders as Next.js Link
 * @param {boolean} [props.disabled=false]
 * @param {boolean} [props.fullWidth=false]
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  href,
  disabled = false,
  fullWidth = false,
  className = '',
  children,
  ...props
}) {
  const buttonClasses = cn(
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    className
  );

  if (href && !disabled) {
    const isExternal = href.startsWith('http') || href.startsWith('//');
    if (isExternal) {
      return (
        <a
          href={href}
          className={buttonClasses}
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={buttonClasses} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={props.type || 'button'}
      className={buttonClasses}
      disabled={disabled}
      aria-disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
