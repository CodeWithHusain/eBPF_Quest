import React from 'react';
import styles from './HeroTerminal.module.css';

/**
 * HeroTerminal component.
 * Displays the authentic developer visual demonstration specified in Stage 2 Section 5:
 * $ bpfquest start
 * [✓] Linux Fundamentals
 * ...
 * Quest initialized...
 */
export default function HeroTerminal() {
  const steps = [
    { text: 'Linux Fundamentals', completed: true },
    { text: 'Processes & Filesystems', completed: true },
    { text: 'eBPF Fundamentals', completed: false, active: true },
    { text: 'Tracing', completed: false },
    { text: 'Networking', completed: false },
    { text: 'XDP', completed: false },
    { text: 'CO-RE', completed: false },
  ];

  return (
    <div className={styles.terminal}>
      <div className={styles.header}>
        <div className={styles.controls} aria-hidden="true">
          <span className={styles.dotClose} />
          <span className={styles.dotMinimize} />
          <span className={styles.dotMaximize} />
        </div>
        <div className={styles.title}>bash — 80x24</div>
        <div className={styles.badge}>tty1</div>
      </div>

      <div className={styles.content}>
        <div className={styles.commandLine}>
          <span className={styles.prompt}>$</span>
          <span className={styles.command}>bpfquest start</span>
        </div>

        <div className={styles.checklist}>
          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`${styles.item} ${step.completed ? styles.completed : ''} ${step.active ? styles.active : ''}`}
            >
              <span className={styles.checkbox}>
                {step.completed ? (
                  <span className={styles.checkMark}>[✓]</span>
                ) : (
                  <span className={styles.emptyCheck}>[ ]</span>
                )}
              </span>
              <span className={styles.itemText}>{step.text}</span>
              {step.active && <span className={styles.activeTag}>current</span>}
            </div>
          ))}
        </div>

        <div className={styles.statusLine}>
          <span className={styles.cursor} />
          <span className={styles.statusText}>Quest initialized...</span>
        </div>
      </div>
    </div>
  );
}
