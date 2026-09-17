'use client';

import React, { useState } from 'react';
import styles from './PlatformPreview.module.css';
import ProgressBar from '@/components/ui/ProgressBar';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';

export default function PlatformPreview() {
  const [activeTab, setActiveTab] = useState('quest');

  const tracks = [
    { name: 'Linux Fundamentals', progress: 100, status: 'COMPLETED', variant: 'emerald' },
    { name: 'eBPF Fundamentals', progress: 35, status: 'IN PROGRESS', variant: 'cyan' },
    { name: 'Kernel Tracing & Kprobes', progress: 0, status: 'LOCKED', variant: 'locked' },
    { name: 'Networking & tc (Traffic Control)', progress: 0, status: 'LOCKED', variant: 'locked' },
    { name: 'XDP (eXpress Data Path)', progress: 0, status: 'LOCKED', variant: 'locked' },
    { name: 'CO-RE & BTF Internals', progress: 0, status: 'LOCKED', variant: 'locked' },
  ];

  const sampleTraceOutput = `[12:04:19.342] bpftrace -e 'kprobe:sys_enter_execve { printf("COMM: %s PID: %d\\n", comm, pid); }'
Attaching 1 probe...
COMM: git           PID: 41829
COMM: cc1           PID: 41830
COMM: as            PID: 41831
COMM: bpfquest-lab  PID: 41832 -> MAP: trace_events [UPDATED 64 bytes]
[KERNEL] eBPF bytecode verified: 14 instructions, 0 loops, safe.`;

  return (
    <div className={styles.windowContainer}>
      {/* Terminal Window Header */}
      <div className={styles.windowHeader}>
        <div className={styles.controls} aria-hidden="true">
          <span className={cn(styles.dot, styles.dotRed)} />
          <span className={cn(styles.dot, styles.dotYellow)} />
          <span className={cn(styles.dot, styles.dotGreen)} />
        </div>
        <div className={styles.windowTitle}>
          <span className={styles.hostPrefix}>user@bpfquest:</span>
          <span className={styles.hostPath}>~/learning-quest</span>
        </div>
        <div className={styles.kernelTag}>
          <span>LINUX 6.8.0-EBPF</span>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabBar} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'quest'}
          className={cn(styles.tab, activeTab === 'quest' && styles.tabActive)}
          onClick={() => setActiveTab('quest')}
        >
          Your Quest Tracker
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'telemetry'}
          className={cn(styles.tab, activeTab === 'telemetry' && styles.tabActive)}
          onClick={() => setActiveTab('telemetry')}
        >
          Live Kernel Telemetry
        </button>
      </div>

      {/* Content Body */}
      <div className={styles.body}>
        {activeTab === 'quest' ? (
          <div className={styles.questTrackList}>
            <div className={styles.overviewHeader}>
              <div>
                <h3 className={styles.overviewTitle}>Active Curriculum Status</h3>
                <p className={styles.overviewSubtitle}>
                  Progress saved locally. Complete labs to unlock downstream kernel modules.
                </p>
              </div>
              <div className={styles.totalProgress}>
                <span className={styles.progressNum}>22%</span>
                <span className={styles.progressLabel}>Overall Mastery</span>
              </div>
            </div>

            <div className={styles.tracks}>
              {tracks.map((track) => (
                <div key={track.name} className={styles.trackItem}>
                  <div className={styles.trackInfo}>
                    <div className={styles.trackTitleGroup}>
                      <span className={styles.trackName}>{track.name}</span>
                      {track.status === 'LOCKED' ? (
                        <span className={styles.lockIcon} aria-label="Locked track">🔒</span>
                      ) : (
                        <Badge variant={track.variant} size="sm">
                          {track.status}
                        </Badge>
                      )}
                    </div>
                    <span className={styles.trackPercent}>{track.progress}%</span>
                  </div>
                  <ProgressBar
                    value={track.progress}
                    variant={track.variant === 'locked' ? 'cyan' : track.variant}
                    size="sm"
                    className={styles.trackProgress}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.telemetryPanel}>
            <pre className={styles.terminalPre}>
              <code>{sampleTraceOutput}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Window Footer Status */}
      <div className={styles.windowFooter}>
        <span className={styles.statusItem}>
          <span className={styles.pulsingDot} /> BPF Verifier: OK
        </span>
        <span className={styles.statusItem}>Ring Buffer: 0 drops</span>
        <span className={styles.statusItem}>Environment: Sandboxed KVM</span>
      </div>
    </div>
  );
}
