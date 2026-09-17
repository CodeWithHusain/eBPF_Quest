# BPFQuest Project Roadmap

This document outlines the architectural milestones achieved in the initial 10-stage release of BPFQuest and details future planned enhancements.

---

## 🏁 Completed Milestones (v1.0.0 Release)

### Stage 1: Foundation & Project Architecture
- Established modern Next.js App Router architecture with pure JavaScript and scoped CSS Modules.
- Established system design tokens, dark kernel aesthetic palette, and atomic UI components.
- Configured ESLint, directory taxonomy, and core layout components.

### Stage 2: Product UI, Navigation & Landing Experience
- Developed responsive marketing layout with `HeroTerminal`, `KernelStackDiagram`, and curriculum roadmaps.
- Built persistent responsive desktop and mobile navigation with active state indicators.
- Created accessible footer, telemetry tags, and brand visual hierarchy.

### Stage 3: Authentication, Accounts & Database Persistence
- Integrated NextAuth.js supporting Credentials and GitHub OAuth providers.
- Designed complete PostgreSQL relational schema via Prisma (Users, Accounts, Sessions, Progress, Attempts, Badges).
- Implemented secure password hashing with bcrypt, session validation, and protected user settings.

### Stage 4: Curriculum Engine & Structured Course System
- Created hierarchical curriculum model: Learning Path → Course → Module → Lesson → Knowledge Check.
- Authored complete 23-lesson "Linux Fundamentals" course spanning 5 core modules.
- Built interactive assessment widgets with immediate feedback and database progress tracking.

### Stage 5: Hands-On Missions & Validation Framework
- Designed CTF-style missions engine with objectives, difficulty tiers, and hint unlocks.
- Implemented deterministic validator abstraction (`missionValidator.js`) evaluating solutions without arbitrary code execution risk.
- Developed mission attempt recording, solution checking, and success states.

### Stage 6: Interactive eBPF Playground & Monaco Editor
- Integrated dual-panel code editor with syntax highlighting and keyboard shortcuts.
- Created curated library of runnable eBPF programs (Syscall tracing, Map counters, XDP filters).
- Built simulated ring buffer output stream and kernel verifier feedback logs.

### Stage 7: Isolated Lab Execution Infrastructure
- Architected sandboxed execution runner using Docker containers with `--network none`.
- Enforced hard resource limits (1 vCPU, 256MB RAM, 64 PIDs, 15s execution timeout).
- Implemented dual-mode provider abstraction (`MockLabProvider` and `ContainerLabProvider`).

### Stage 8: Gamification, Streaks & XP Engine
- Built atomic XP transaction ledger preventing double-crediting.
- Implemented milestone-based achievement badges (First Syscall, Streak Master, Kernel Pioneer).
- Built streak calculation engine tracking consecutive active learning days.

### Stage 9: Security Hardening, Observability & Rate Limiting
- Enforced in-memory sliding-window rate limiting on sensitive API endpoints (`/api/auth/*`, `/api/missions/submit`, `/api/playground/execute`).
- Built structured JSON observability logger with security event classifications.
- Created comprehensive test suite (57 automated tests) with zero lint errors and verified Docker deployment stack.

### Stage 10: Final Integration & Open-Source Launch
- Implemented instant global search (`Ctrl+K`) across curriculum, missions, playground, and documentation.
- Built comprehensive documentation hub (`/docs`) covering Linux internals, eBPF verifier mechanics, and lab isolation.
- Created live lab environment status hub (`/labs`) showing runner telemetry and resource envelopes.
- Created automated content integrity validation script (`scripts/validateContent.js`) integrated into CI.
- Published open-source governance documents, issue templates, PR templates, and deployment guides.

---

## 🚀 Future Roadmap & Post-v1.0 Enhancements

### Phase 1: MicroVM Lab Orchestration
- **Firecracker / Cloud-Hypervisor Integration**: Migrate lab environments from container sandboxes to ephemeral microVMs booted with custom, minimal Linux kernels in <200ms.
- **Dedicated Verifier Pipeline**: Run user-submitted eBPF bytecode through real kernel `bpf(BPF_PROG_LOAD)` syscalls inside isolated guests to capture genuine kernel verifier rejection logs.

### Phase 2: Expanded Curriculum Tracks
- **Linux Networking Architecture**: Deep dive into network namespaces, veth pairs, iptables/nftables, and socket buffer (`sk_buff`) traversal.
- **Kernel Observability & Tracing**: Hands-on exploration of kprobes, uprobes, ftrace, perf_events, and `bpftrace` one-liners.
- **Production eBPF with CO-RE**: Writing portable BPF programs using `libbpf-bootstrap`, `vmlinux.h`, and BPF Type Format (BTF).
- **High-Performance XDP**: Building bare-metal packet filters and DDoS mitigation engines running at the network interface driver level.

### Phase 3: Platform & Community Features
- **Classroom & Team Workspaces**: Allow university instructors and engineering teams to track collective progress and assign custom mission sets.
- **Community Mission Registry**: Enable contributors to author, review, and publish mission packs via GitHub PRs with automated sandboxed testing.
- **Live Kernel Telemetry Visualizer**: WebGL/Canvas-based interactive flow visualizer animating packet traversal and syscall routing through the kernel subsystem.
