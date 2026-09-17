import React from 'react';
import styles from './XPBar.module.css';

export default function XPBar({
  currentLevel = 1,
  rank = 'Novice',
  xpInCurrentLevel = 0,
  xpNeededForNextLevel = 150,
  progressPercent = 0,
  totalXP = 0,
}) {
  return (
    <div className={styles.wrapper} role="region" aria-label="XP Progression Level">
      <div className={styles.header}>
        <div className={styles.levelBadge}>
          <span className={styles.levelNum}>LVL {currentLevel}</span>
          <span className={styles.rankTitle}>{rank}</span>
        </div>
        <div className={styles.xpCounts}>
          <span className={styles.currentXP}>{xpInCurrentLevel} XP</span>
          <span className={styles.targetXP}> / {xpNeededForNextLevel} XP to Level {currentLevel + 1}</span>
        </div>
      </div>

      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Level ${currentLevel} progression: ${progressPercent}%`}
      >
        <div className={styles.fill} style={{ width: `${progressPercent}%` }} />
      </div>

      <div className={styles.footer}>
        <span className={styles.totalLabel}>Total Career: {totalXP} XP</span>
        <span className={styles.percentLabel}>{progressPercent}% Complete</span>
      </div>
    </div>
  );
}