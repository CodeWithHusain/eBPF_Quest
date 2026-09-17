# Changelog

All notable changes to the BPFQuest project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-09-16

### Added
- **Global Search (`Ctrl+K`)**: Fast in-memory search modal indexing courses, individual lessons, missions, playground examples, and documentation pages.
- **Documentation Hub (`/docs`)**: In-depth technical guides explaining Linux protection rings, system calls, eBPF verifier proofs, lab security isolation, and content authoring.
- **Lab Infrastructure Hub (`/labs`)**: Real-time runner telemetry view reporting active provider status (`mock` vs `container`), resource constraints (1 vCPU, 256MB RAM, 64 PIDs), network isolation (`--network none`), and Docker runner setup.
- **Deterministic Dashboard Recommendations**: Progress-derived next-step suggestions calculating highest incomplete lesson or mission without simulated AI fluff.
- **Content Integrity Validator (`scripts/validateContent.js`)**: Automated test script verifying courses, lessons, knowledge checks, missions, and playground examples in CI.
- **SEO & Search Bot Guidance**: Dynamic `sitemap.xml` route indexing public paths and `robots.txt` disallowing private user dashboards and authentication routes.
- **Open Source Governance**: Added `ROADMAP.md`, `CHANGELOG.md`, `.github/pull_request_template.md`, issue templates, `.github/CODEOWNERS`, and operational guides for deployment and releases.

---

## [0.9.0] - 2026-09-16

### Added
- **Security Hardening**: Sliding-window rate limiter on `/api/auth/*`, `/api/missions/submit`, and `/api/playground/execute`.
- **Structured JSON Logger**: Security event classification (`AUTH_FAILURE`, `RATE_LIMIT_EXCEEDED`, `UNAUTHORIZED_ACCESS`, `EXECUTION_ERROR`).
- **Comprehensive Automated Tests**: Added test suites for rate limiting, validation schemas, security headers, database operations, and system health checks.
- **Docker Compose Stack**: Production-ready multi-service compose file (`docker-compose.yml`) pairing web app with isolated lab runner container.

---

## [0.8.0] - 2026-09-15

### Added
- **Gamification Engine**: Atomic XP ledger tracking points for lesson completion, knowledge checks, and mission success.
- **Achievement Badges**: Milestone-based unlock criteria with visual badges on profile and dashboard.
- **Streak Tracker**: Consecutive learning day counter with calendar heatmap visualization.

---

## [0.7.0] - 2026-09-14

### Added
- **Isolated Lab Architecture**: Sandboxed container execution abstraction with resource constraints and zero network access.
- **Execution Job Queue**: Asynchronous submission handling with timeout enforcement and output sanitization.
- **Provider Abstraction**: Pluggable provider architecture supporting local mock runner and live Docker runner.

---

## [0.6.0] - 2026-09-13

### Added
- **Interactive eBPF Playground**: Browser-based code editor with syntax highlighting and kernel header references.
- **Curated Examples**: Tracepoints, kprobes, ring buffer outputs, and XDP packet dropping samples.
- **Telemetry Console**: Streaming event log displaying formatted syscall inspection logs.

---

## [0.5.0] - 2026-09-12

### Added
- **Hands-On Missions System**: Guided CTF challenges covering process inspection, file descriptors, and network interface analysis.
- **Deterministic Validator**: Safe solution checking with objective tracking and contextual feedback.
- **Hint Engine**: Tiered clue revelation mechanism tied to mission attempts.

---

## [0.4.0] - 2026-09-11

### Added
- **Curriculum Architecture**: Hierarchical Learning Path → Course → Module → Lesson → Knowledge Check hierarchy.
- **Linux Fundamentals Course**: 23 comprehensive lessons spanning shell mechanics, filesystem hierarchies, processes, permissions, and network sockets.
- **Interactive Knowledge Checks**: Instant feedback quizzes validating conceptual comprehension.

---

## [0.3.0] - 2026-09-10

### Added
- **Authentication System**: NextAuth.js credentials login, registration, and GitHub OAuth integration.
- **Relational Persistence**: PostgreSQL schema with Prisma ORM for users, sessions, and learning records.
- **User Dashboard & Profile**: Personalized progress tracking and account preferences.

---

## [0.2.0] - 2026-09-09

### Added
- **Product UI Design System**: Dark kernel aesthetic with custom typography, badge tokens, and buttons.
- **Landing Experience**: Hero terminal animation, Linux kernel stack architectural diagram, and feature cards.
- **Responsive Layout**: Sticky navigation bar, accessible mobile drawer, and footer.

---

## [0.1.0] - 2026-09-08

### Added
- Initial project scaffolding using Next.js App Router and vanilla JavaScript.
- Project structure, architecture guidelines, and foundational configuration.
