import React from 'react';
import styles from './LearningPathFlow.module.css';
import Badge from '@/components/ui/Badge';

/**
 * LearningPathFlow
 * Visual representation of the planned 10-milestone learning journey specified in Section 8.
 */
export default function LearningPathFlow() {
  const steps = [
    {
      id: 1,
      title: 'Linux Foundations',
      desc: 'Userspace architecture, memory protection rings, and the shell boundary.',
      difficulty: 'Beginner',
      status: 'UNLOCKED',
      variant: 'emerald',
    },
    {
      id: 2,
      title: 'Processes & System Calls',
      desc: 'Context transitions, syscall interception, and task scheduling.',
      difficulty: 'Beginner',
      status: 'AVAILABLE',
      variant: 'emerald',
    },
    {
      id: 3,
      title: 'Kernel Fundamentals',
      desc: 'Monolithic kernel mechanics, data structures, and privilege escalation traps.',
      difficulty: 'Beginner',
      status: 'PLANNED',
      variant: 'locked',
    },
    {
      id: 4,
      title: 'eBPF Fundamentals',
      desc: 'The in-kernel virtual machine, instruction set, and verifier proofs.',
      difficulty: 'Beginner',
      status: 'PLANNED',
      variant: 'locked',
    },
    {
      id: 5,
      title: 'Maps & Helpers',
      desc: 'In-kernel persistent storage (hash, array, perf/ring buffers) and helper functions.',
      difficulty: 'Intermediate',
      status: 'PLANNED',
      variant: 'locked',
    },
    {
      id: 6,
      title: 'Tracing & Observability',
      desc: 'Dynamic instrumentation via kprobes, uprobes, and static kernel tracepoints.',
      difficulty: 'Intermediate',
      status: 'PLANNED',
      variant: 'locked',
    },
    {
      id: 7,
      title: 'Networking & tc',
      desc: 'Traffic control classifier hooks and socket filter programs.',
      difficulty: 'Intermediate',
      status: 'PLANNED',
      variant: 'locked',
    },
    {
      id: 8,
      title: 'XDP (eXpress Data Path)',
      desc: 'Zero-copy bare-metal packet filtering directly at the network card driver level.',
      difficulty: 'Advanced',
      status: 'PLANNED',
      variant: 'locked',
    },
    {
      id: 9,
      title: 'CO-RE & libbpf',
      desc: 'Compile Once – Run Everywhere across varying kernel header offsets with BTF.',
      difficulty: 'Advanced',
      status: 'PLANNED',
      variant: 'locked',
    },
    {
      id: 10,
      title: 'Advanced eBPF Systems',
      desc: 'Production security enforcement, LSM hooks, and high-volume telemetry engines.',
      difficulty: 'Advanced',
      status: 'PLANNED',
      variant: 'locked',
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {steps.map((step, idx) => {
          const isUnlocked = step.status === 'UNLOCKED' || step.status === 'AVAILABLE';
          return (
            <div
              key={step.id}
              className={`${styles.card} ${isUnlocked ? styles.unlockedCard : styles.lockedCard}`}
            >
              <div className={styles.cardTop}>
                <span className={styles.stepNum}>
                  STEP {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                </span>
                <div className={styles.badges}>
                  <Badge
                    variant={
                      step.difficulty === 'Beginner'
                        ? 'emerald'
                        : step.difficulty === 'Intermediate'
                        ? 'orange'
                        : 'purple'
                    }
                    size="sm"
                  >
                    {step.difficulty}
                  </Badge>
                  {isUnlocked ? (
                    <Badge variant="cyan" size="sm">
                      Ready
                    </Badge>
                  ) : (
                    <span className={styles.lockIcon} aria-label="Planned milestone">
                      🔒
                    </span>
                  )}
                </div>
              </div>

              <h4 className={styles.title}>{step.title}</h4>
              <p className={styles.desc}>{step.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
