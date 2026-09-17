'use client';

import React, { useState } from 'react';
import styles from './TerminalVisual.module.css';

/**
 * TerminalVisual Component
 * Renders an interactive Linux terminal window preview with commands, outputs, and copy function.
 *
 * @param {Object} props
 * @param {string} props.command - Command to execute/display
 * @param {string} [props.output] - Terminal command output
 * @param {string} [props.title] - Window title bar text
 * @param {string} [props.prompt] - Shell prompt indicator (default: '$')
 */
export default function TerminalVisual({
  command = '',
  output = '',
  title = 'bash',
  prompt = '$',
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy terminal command:', err);
    }
  };

  return (
    <div className={styles.terminal}>
      <div className={styles.header}>
        <div className={styles.controls} aria-hidden="true">
          <span className={`${styles.dot} ${styles.dotRed}`} />
          <span className={`${styles.dot} ${styles.dotYellow}`} />
          <span className={`${styles.dot} ${styles.dotGreen}`} />
        </div>
        <div className={styles.title}>{title}</div>
        <button
          type="button"
          onClick={handleCopy}
          className={styles.copyBtn}
          title="Copy command"
        >
          {copied ? 'Copied ✓' : 'Copy'}
        </button>
      </div>
      <div className={styles.body}>
        <div className={styles.commandLine}>
          <span className={styles.prompt}>{prompt}</span>
          <code className={styles.command}>{command}</code>
        </div>
        {output ? <pre className={styles.output}>{output}</pre> : null}
      </div>
    </div>
  );
}
