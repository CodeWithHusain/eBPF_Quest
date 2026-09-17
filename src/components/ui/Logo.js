import React from 'react';
import Link from 'next/link';
import styles from './Logo.module.css';
import { cn } from '@/lib/utils/cn';

/**
 * BPFQuest Logo & Wordmark
 * Geometric icon inspired by:
 * Kernel boundaries (hexagon) + Tracing paths (converging vectors) + eBPF spark (core waypoint).
 * 
 * @param {Object} props
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {boolean} [props.showIcon=true]
 * @param {boolean} [props.showText=true]
 * @param {boolean} [props.asLink=true]
 * @param {string} [props.className]
 */
export default function Logo({
  size = 'md',
  showIcon = true,
  showText = true,
  asLink = true,
  className = '',
  ...props
}) {
  const content = (
    <div className={cn(styles.logo, styles[size], className)} {...props}>
      {showIcon && (
        <svg
          className={styles.icon}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Hexagonal Kernel Boundary */}
          <polygon
            points="16,2 29,9.5 29,24.5 16,32 3,24.5 3,9.5"
            className={styles.hexBg}
          />
          <polygon
            points="16,2 29,9.5 29,24.5 16,32 3,24.5 3,9.5"
            className={styles.hexBorder}
          />
          {/* Tracing path from user space */}
          <path
            d="M8 12L16 17L24 12"
            className={styles.traceLine}
          />
          {/* Deep kernel hook probe */}
          <path
            d="M16 17V26"
            className={styles.probeLine}
          />
          {/* Core eBPF Hook Node */}
          <circle cx="16" cy="17" r="2.8" className={styles.hookNode} />
          {/* Waypoint Spark */}
          <circle cx="24" cy="12" r="1.5" className={styles.sparkNode} />
        </svg>
      )}

      {showText && (
        <span className={styles.wordmark}>
          <span className={styles.bpf}>BPF</span>
          <span className={styles.quest}>Quest</span>
        </span>
      )}
    </div>
  );

  if (asLink) {
    return (
      <Link href="/" className={styles.linkWrapper} aria-label="BPFQuest Homepage">
        {content}
      </Link>
    );
  }

  return content;
}
