'use client';

import React, { useState } from 'react';
import styles from './CodeBlock.module.css';
import { cn } from '@/lib/utils/cn';

/**
 * Terminal-styled CodeBlock component with window decoration and copy-to-clipboard.
 * 
 * @param {Object} props
 * @param {string} props.code - The code string to display
 * @param {string} [props.language='c'] - Language identifier
 * @param {string} [props.title] - Optional title or filename
 * @param {boolean} [props.showLineNumbers=false]
 * @param {string} [props.className]
 */
export default function CodeBlock({
  code = '',
  language = 'c',
  title,
  showLineNumbers = false,
  className = '',
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code', err);
    }
  };

  const lines = code.trim().split('\n');

  return (
    <div className={cn(styles.wrapper, className)}>
      <div className={styles.header}>
        <div className={styles.controls} aria-hidden="true">
          <span className={cn(styles.dot, styles.dotClose)} />
          <span className={cn(styles.dot, styles.dotMinimize)} />
          <span className={cn(styles.dot, styles.dotMaximize)} />
        </div>
        <div className={styles.title}>
          {title || language}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className={styles.copyBtn}
          aria-label={copied ? 'Code copied to clipboard' : 'Copy code to clipboard'}
        >
          {copied ? (
            <span className={styles.copiedText}>Copied ✓</span>
          ) : (
            <span>Copy</span>
          )}
        </button>
      </div>
      <div className={styles.codeContainer}>
        <pre className={styles.pre}>
          <code>
            {showLineNumbers ? (
              lines.map((line, idx) => (
                <div key={idx} className={styles.line}>
                  <span className={styles.lineNumber}>{idx + 1}</span>
                  <span className={styles.lineContent}>{line}</span>
                </div>
              ))
            ) : (
              code
            )}
          </code>
        </pre>
      </div>
    </div>
  );
}
