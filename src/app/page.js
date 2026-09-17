import React from 'react';
import styles from './page.module.css';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import HeroTerminal from '@/components/shared/HeroTerminal';
import KernelStackDiagram from '@/components/shared/KernelStackDiagram';
import LearningPathFlow from '@/components/shared/LearningPathFlow';
import MissionCardPreview from '@/components/shared/MissionCardPreview';
import PlaygroundMockup from '@/components/shared/PlaygroundMockup';
import { siteConfig } from '@/config/site';

export default function HomePage() {
  const steps = [
    {
      num: '01',
      title: 'Learn',
      subtitle: 'Understand the concepts.',
      desc: 'Master operating system fundamentals, protection rings, and how the Linux kernel dispatches system calls before jumping into eBPF.',
    },
    {
      num: '02',
      title: 'Practice',
      subtitle: 'Experiment with examples.',
      desc: 'Inspect real C syscall implementations, execute tracing commands with strace and bpftrace, and see how memory maps behave.',
    },
    {
      num: '03',
      title: 'Solve',
      subtitle: 'Complete hands-on missions.',
      desc: 'Take on CTF-style quests: intercept rogue processes, inspect socket buffers, detect hidden syscall changes, and earn quest XP.',
    },
    {
      num: '04',
      title: 'Master',
      subtitle: 'Build real systems knowledge.',
      desc: 'Progress toward bare-metal XDP packet filters, CO-RE portability across production kernels, and low-overhead observability.',
    },
  ];

  const features = [
    {
      title: 'Interactive Learning',
      status: 'Live',
      variant: 'emerald',
      desc: 'Learn concepts through structured, step-by-step technical lessons with clear prerequisites, objectives, and code walk-throughs.',
      href: '/learn',
    },
    {
      title: 'Hands-on Missions',
      status: 'Live',
      variant: 'emerald',
      desc: 'Solve practical Linux and eBPF problems modeled after real security investigations, observability tasks, and network filters.',
      href: '/missions',
    },
    {
      title: 'Linux Lab Isolation',
      status: 'Live',
      variant: 'emerald',
      desc: 'Experiment inside isolated Linux container sandboxes with memory limits, PID constraints, and network isolation.',
      href: '/labs',
    },
    {
      title: 'eBPF Playground',
      status: 'Live',
      variant: 'emerald',
      desc: 'Write, compile, inspect bytecode maps, and verify eBPF programs directly in the browser editor with live output.',
      href: '/playground',
    },
    {
      title: 'Progress & Streaks',
      status: 'Live',
      variant: 'emerald',
      desc: 'Track curriculum completion, earned skill badges, daily streaks, and deterministic recommended next steps.',
      href: '/dashboard',
    },
    {
      title: '100% Open Source',
      status: 'Active',
      variant: 'emerald',
      desc: 'Learn in public and contribute to the curriculum. Fully open source under the Apache-2.0 license.',
      href: siteConfig.links.github,
      external: true,
    },
  ];

  return (
    <div className={styles.page}>
      {/* 1. HERO SECTION */}
      <Section spacing="xl" className={styles.heroSection}>
        <Container>
          <div className={styles.heroLayout}>
            <div className={styles.heroTextCol}>
              <div className={styles.heroBadgeRow}>
                <Badge variant="cyan" size="sm">
                  OPEN SOURCE PLATFORM
                </Badge>
                <span className={styles.heroSubTag}>v1.0.0 Open Source Release</span>
              </div>

              <h1 className={styles.heroHeadline}>
                Master Linux. Explore eBPF. <br />
                <span className={styles.gradientHeadline}>Build at the Kernel Level.</span>
              </h1>

              <p className={styles.heroCopy}>
                BPFQuest is an open-source, hands-on learning platform for mastering Linux and eBPF through interactive lessons, practical missions, and real systems experimentation.
              </p>

              <div className={styles.heroCtaGroup}>
                <Button variant="primary" size="lg" href="/learn">
                  Start Your Quest
                </Button>
                <Button variant="outline" size="lg" href="/learn">
                  Explore the Curriculum
                </Button>
              </div>

              <div className={styles.heroSubNotice}>
                <span>✓ Zero setup required to start</span>
                <span>✓ Pure developer tool aesthetic</span>
                <span>✓ No fake metrics</span>
              </div>
            </div>

            <div className={styles.heroVisualCol}>
              <HeroTerminal />
            </div>
          </div>
        </Container>
      </Section>

      {/* 2. PROBLEM / PURPOSE SECTION */}
      <Section spacing="xl" background="secondary" className={styles.purposeSection}>
        <Container>
          <div className={styles.sectionHeadingCenter}>
            <Badge variant="orange" size="sm">THE PROBLEM</Badge>
            <h2 className={styles.sectionTitle}>
              eBPF is powerful. Learning it shouldn&apos;t be.
            </h2>
            <p className={styles.sectionLead}>
              Most developers encounter eBPF after struggling through fragmented kernel docs, outdated C samples, and cryptic verifier rejections. Real mastery requires understanding every layer of the operating system stack:
            </p>
          </div>

          <KernelStackDiagram />

          <div className={styles.purposeFootnote}>
            <p>
              <strong>BPFQuest bridges this gap:</strong> We start with operating system fundamentals and systematically guide you through system calls, kernel verifier rules, and production tracing.
            </p>
          </div>
        </Container>
      </Section>

      {/* 3. HOW BPFQUEST WORKS */}
      <Section spacing="xl" className={styles.howItWorksSection}>
        <Container>
          <div className={styles.sectionHeadingCenter}>
            <Badge variant="cyan" size="sm">METHODOLOGY</Badge>
            <h2 className={styles.sectionTitle}>How BPFQuest Works</h2>
            <p className={styles.sectionLead}>
              A 4-step progressive learning cycle designed to build authentic low-level intuition.
            </p>
          </div>

          <div className={styles.stepsGrid}>
            {steps.map((step) => (
              <Card key={step.num} variant="bordered" className={styles.stepCard}>
                <div className={styles.stepNum}>{step.num}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <div className={styles.stepSubtitle}>{step.subtitle}</div>
                <p className={styles.stepDesc}>{step.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* 4. LEARNING PATH PREVIEW */}
      <Section spacing="xl" background="primary" className={styles.learningPathSection}>
        <Container>
          <div className={styles.sectionHeadingCenter}>
            <Badge variant="emerald" size="sm">CURRICULUM ROADMAP</Badge>
            <h2 className={styles.sectionTitle}>The 10-Stage Learning Journey</h2>
            <p className={styles.sectionLead}>
              From raw user/kernel space context switches to bare-metal XDP packet handling and CO-RE portability.
            </p>
          </div>

          <LearningPathFlow />
        </Container>
      </Section>

      {/* 5. FEATURE SECTION */}
      <Section spacing="xl" className={styles.featuresSection}>
        <Container>
          <div className={styles.sectionHeadingCenter}>
            <Badge variant="cyan" size="sm">CAPABILITIES</Badge>
            <h2 className={styles.sectionTitle}>Engineered for Real Systems Understanding</h2>
            <p className={styles.sectionLead}>
              Transparently distinguishing current foundational functionality from upcoming infrastructure stages.
            </p>
          </div>

          <div className={styles.featuresGrid}>
            {features.map((feat) => (
              <Card key={feat.title} variant="interactive" className={styles.featureCard}>
                <div className={styles.featureTop}>
                  <Badge variant={feat.variant} size="sm">
                    {feat.status}
                  </Badge>
                </div>
                <h3 className={styles.featureTitle}>{feat.title}</h3>
                <p className={styles.featureDesc}>{feat.desc}</p>
                <div className={styles.featureLink}>
                  <Button
                    variant="ghost"
                    size="sm"
                    href={feat.href}
                    {...(feat.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    View Details →
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* 6. MISSION PREVIEW */}
      <Section spacing="xl" background="secondary" className={styles.missionPreviewSection}>
        <Container>
          <div className={styles.sectionHeadingCenter}>
            <Badge variant="emerald" size="sm">MISSION PREVIEW</Badge>
            <h2 className={styles.sectionTitle}>Sample Quest Challenge</h2>
            <p className={styles.sectionLead}>
              Hands-on missions test your ability to intercept, inspect, and analyze system calls.
            </p>
          </div>

          <MissionCardPreview />
        </Container>
      </Section>

      {/* 7. PLAYGROUND PREVIEW */}
      <Section spacing="xl" className={styles.playgroundPreviewSection}>
        <Container>
          <div className={styles.sectionHeadingCenter}>
            <Badge variant="emerald" size="sm">LIVE SANDBOX</Badge>
            <h2 className={styles.sectionTitle}>Interactive eBPF Playground</h2>
            <p className={styles.sectionLead}>
              Experiment with code, examine verifier logs, and inspect synthetic ring buffer events directly in your browser.
            </p>
          </div>

          <PlaygroundMockup />
        </Container>
      </Section>

      {/* 8. OPEN-SOURCE SECTION */}
      <Section spacing="lg" background="primary" className={styles.openSourceSection}>
        <Container size="narrow">
          <div className={styles.openSourceContent}>
            <Badge variant="cyan" size="sm">100% OPEN SOURCE</Badge>
            <h2 className={styles.openSourceTitle}>Built in the open.</h2>
            <p className={styles.openSourceDesc}>
              BPFQuest is developed openly under the Apache-2.0 license. Anyone can inspect the code, propose new curriculum tracks, report issues, or contribute hands-on kernel missions.
            </p>
            <div className={styles.openSourceButtons}>
              <Button
                variant="primary"
                size="md"
                href={siteConfig.links.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on GitHub
              </Button>
              <Button
                variant="outline"
                size="md"
                href="https://github.com/bpfquest/bpfquest/blob/main/CONTRIBUTING.md"
                target="_blank"
                rel="noopener noreferrer"
              >
                Contribute to BPFQuest
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      {/* 9. COMMUNITY SECTION */}
      <Section spacing="lg" className={styles.communitySection}>
        <Container>
          <div className={styles.sectionHeadingCenter}>
            <Badge variant="emerald" size="sm">ECOSYSTEM</Badge>
            <h2 className={styles.sectionTitle}>Join the Community</h2>
            <p className={styles.sectionLead}>
              Learn with developers exploring Linux and eBPF.
            </p>
          </div>

          <div className={styles.communityGrid}>
            <Card variant="bordered" className={styles.communityCard}>
              <h3 className={styles.commTitle}>GitHub Discussions</h3>
              <p className={styles.commDesc}>Ask architectural questions, exchange debugging strategies, and propose course ideas.</p>
              <Button variant="ghost" size="sm" href={siteConfig.links.community} target="_blank" rel="noopener noreferrer">
                Open Discussions ↗
              </Button>
            </Card>

            <Card variant="bordered" className={styles.communityCard}>
              <h3 className={styles.commTitle}>Documentation & Guides</h3>
              <p className={styles.commDesc}>Read comprehensive architecture whitepapers and eBPF map type reference cheat sheets.</p>
              <Button variant="ghost" size="sm" href="/docs">
                Explore Docs →
              </Button>
            </Card>

            <Card variant="bordered" className={styles.communityCard}>
              <h3 className={styles.commTitle}>Public Roadmap</h3>
              <p className={styles.commDesc}>Track progress across our 10 planned stages from foundation to multi-tenant lab clusters.</p>
              <Button variant="ghost" size="sm" href="/docs">
                View 10-Stage Roadmap →
              </Button>
            </Card>
          </div>
        </Container>
      </Section>

      {/* 10. FINAL CTA */}
      <Section spacing="xl" background="secondary" className={styles.finalCtaSection}>
        <Container size="narrow">
          <div className={styles.ctaCard}>
            <h2 className={styles.ctaTitle}>Your journey to the kernel starts here.</h2>
            <p className={styles.ctaSubtitle}>
              Start with Linux. Learn eBPF. Build systems-level intuition.
            </p>
            <div className={styles.ctaActions}>
              <Button variant="primary" size="lg" href="/learn">
                Start Your Quest
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
