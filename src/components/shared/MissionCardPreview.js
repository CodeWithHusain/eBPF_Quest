import React from 'react';
import styles from './MissionCardPreview.module.css';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

/**
 * MissionCardPreview
 * Renders the exact sample mission interface specified in Section 10:
 * MISSION 01: Observe a Process
 */
export default function MissionCardPreview() {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.missionTag}>
          <span className={styles.missionNum}>MISSION 01</span>
          <Badge variant="emerald" size="sm">Beginner</Badge>
        </div>
        <div className={styles.category}>
          <span>Linux / Processes</span>
        </div>
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>Observe a Process</h3>

        <div className={styles.section}>
          <h4 className={styles.sectionHeading}>Objective</h4>
          <p className={styles.sectionText}>
            Identify which system calls a target process performs during initialization and file access.
          </p>
        </div>

        <div className={styles.section}>
          <h4 className={styles.sectionHeading}>Skills Practiced</h4>
          <ul className={styles.skillsList}>
            <li>• Linux processes & task structs</li>
            <li>• System calls (openat, read, write)</li>
            <li>• Tracing with strace & bpftrace</li>
          </ul>
        </div>

        <div className={styles.footer}>
          <div className={styles.xpBlock}>
            <span className={styles.xpLabel}>REWARD</span>
            <span className={styles.xpValue}>100 XP</span>
          </div>

          <Button variant="primary" size="md" href="/missions">
            Start Mission
          </Button>
        </div>
      </div>
    </div>
  );
}
