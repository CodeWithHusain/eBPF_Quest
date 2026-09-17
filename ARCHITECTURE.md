# BPFQuest System Architecture

This document provides a comprehensive architectural blueprint for BPFQuest across its frontend, backend, authentication system, database strategy, isolated lab execution infrastructure, and security boundaries.

```text
                    BPFQuest Web Application (Next.js)
                                  │
                                  ▼
                   Authenticated Execution API (/api/execution)
                                  │
                                  ▼
                         Execution Job Queue
                                  │
                                  ▼
                       Dedicated Execution Worker
                                  │
                                  ▼
                           Lab Orchestrator
                                  │
                                  ▼
                            Lab Provider
                ┌─────────────────┴─────────────────┐
                ▼                                   ▼
        Mock Lab Provider                Hardened Container Sandbox
      (Safe Zero-Host Dev)             (Unprivileged, No-Net Egress)
                │                                   │
                └─────────────────┬─────────────────┘
                                  ▼
                       Disposable Isolated Lab
                                  │
                         ┌────────┴────────┐
                         ▼                 ▼
                       Linux             eBPF
                         │                 │
                         └────────┬────────┘
                                  ▼
                           Result Collector
                                  │
                                  ▼
                          Mission Validator
                                  │
                                  ▼
                         Sanitized Output / DB
```

---

## 1. Authentication Architecture (Stage 3)

### Multi-Provider Strategy
1. **GitHub OAuth**: The primary provider for developer audiences. Reads public profile info (`id`, `name`, `email`, `avatar_url`, `login`) and creates/links the user account in PostgreSQL.
2. **Credentials Provider**: Supports email or username + password authentication for local development and environments without configured OAuth credentials. Passwords are salted and hashed with `bcryptjs` (cost factor 10).

### Session Security Model
* **JWT Strategy**: NextAuth uses secure, HTTP-only, encrypted JWT session cookies with `SameSite=Lax` and `Secure` flags in production.
* **Token Payload**: Stores only safe identifiers: `id`, `username`, `role`. Passwords and sensitive tokens are strictly excluded.
* **Server-Side Validation**: Protected pages (`/dashboard`, `/profile`, `/settings`) use `requireAuth()` server-side to fetch verified user data directly from Prisma, ignoring untrusted client states.
* **Middleware**: `middleware.js` intercepts anonymous traffic attempting to reach protected paths and redirects to `/login?callbackUrl=...`.

---

## 2. Database Service Layer & Schema

### Service Layer (`src/lib/db/`)
Prisma queries are strictly contained in dedicated service modules:
* `src/lib/db/users.js`: User authentication, registration, profiles.
* `src/lib/db/learning.js`: Curriculum progression and lesson completion.
* `src/lib/db/missions.js`: Challenge attempts, prerequisites verification, completion records.

### Prisma Entity Mapping
* `User`: Profiles, usernames, roles (`STUDENT`, `INSTRUCTOR`, `ADMIN`), hashed passwords.
* `ExecutionJob`: Persistent execution jobs (`QUEUED`, `RUNNING`, `COMPLETED`, `FAILED`, `TIMEOUT`, `CANCELLED`).
* `Lab`: Disposable sandbox session state (`CREATING`, `READY`, `RUNNING`, `DESTROYED`).
* Downstream entities: `Course`, `Module`, `Lesson`, `Mission`, `Submission`, `Progress`, `Badge`.

---

## 3. Interactive eBPF Playground (Stage 6)

The BPFQuest Playground provides a browser-based systems development environment:
* **Monaco Code Editor**: Real browser editor with C syntax highlighting, line numbers, bracket matching, dark theme, and tab indentation.
* **Playground Registry (`src/services/playgroundService.js`)**: Repository-controlled library of canonical eBPF examples grouped by category (*Getting Started*, *Tracing*, *Maps*, *Networking*).
* **Playground Executor (`src/lib/execution/playgroundExecutor.js`)**: Connected directly to the Stage 7 execution service and lab orchestrator.

---

## 4. Isolated Lab Execution Infrastructure (Stage 7)

### Trust Boundaries & Defense-in-Depth
* **Application / Host Separation**: The Next.js web application and API handlers NEVER compile C files, execute shell commands, or invoke `docker exec` directly.
* **Job Queue (`src/services/execution/jobQueue.js`)**: Decouples HTTP request/response loops from resource-heavy execution. Enforces per-user concurrency limits (max 2), global queue concurrency (max 10), and sliding window rate limits (12 jobs/min).
* **Dedicated Worker (`src/services/execution/executionWorker.js`)**: Consumes jobs asynchronously, initiates lab creation via the orchestrator, and collects/sanitizes results before persisting to PostgreSQL.
* **Lab Provider Interface (`src/services/labs/labProvider.js`)**:
  - `MockLabProvider`: Safe default for local development. Performs zero host execution, syntax validation, ELF symbol simulation, and clearly labels mock outputs.
  - `ContainerLabProvider`: Production container runner blueprint. Enforces unprivileged execution, `--network none` (zero internet egress), 256MB RAM cap, 1 vCPU cap, and strict PID ceilings. Safely returns `LAB_EXECUTION_UNAVAILABLE` unless explicitly enabled via `ENABLE_CONTAINER_LABS=true`.
* **Lab Orchestrator (`src/services/labs/labOrchestrator.js`)**: Guarantees ephemeral teardown via `try ... finally { await provider.destroyLab() }`. Implements a hard timeout watchdog (10s default, 15s max) and periodic reaper for abandoned sandboxes.
* **Output Sanitization & Limits (`src/services/execution/executionPolicy.js`)**: Caps outputs at 64KB and strips any accidental environment variable or credential leaks.

---

## 5. Progress, XP, Achievements & Gamification (Stage 8)

### Transparent & Idempotent Mechanics
* **Server-Side Rewards Only**: All XP transactions (`src/services/gamification/xpService.js`) are triggered exclusively by trusted server-side completion events. Clients cannot submit XP claims.
* **Database Unique Constraints**: `@@unique([userId, sourceType, sourceId, rewardType])` guarantees that repeated requests, retries, or page reloads never duplicate XP.
* **Deterministic Level Formula**: Level \(L = \lfloor\sqrt{\text{totalXP}/50}\rfloor + 1\). Quest ranks (*Novice*, *Explorer*, *Tracer*, *Probe*, *Kernel Apprentice*, *Kernel Engineer*) provide meaningful in-platform milestones without claiming external certifications.
* **Technical Achievement Engine (`src/services/gamification/achievementService.js`)**: Automatically unlocks badges based on verifiable technical events (first lesson, first mission passed, first eBPF ELF program compiled). Enforces single-unlock constraint via `@@unique([userId, achievementId])`.
* **UTC Midnight-Normalized Streaks (`src/services/gamification/streakService.js`)**: Consecutive calendar-day tracking normalized to UTC midnight. Same-day actions do not duplicate streak increments; gaps of 2+ days reset current streak while preserving personal records.

---

## 6. Security Hardening, Observability & Production Readiness (Stage 9)

### Core Hardening Architecture
* **HTTP Security Headers**: Enforced across all routes in `next.config.mjs` (`Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`).
* **Sliding Window Rate Limiter (`src/lib/security/rateLimiter.js`)**: In-memory rate limiting engine protecting registration, mission submission, execution jobs, and profile updates. Returns standard HTTP 429 with `Retry-After` headers.
* **Structured Observability (`src/lib/observability/logger.js`)**: Contextual JSON logger for production, with automated credential scrubbing (`password`, `token`, `secret`, `authorization`, `database_url`) and end-to-end correlation tracking (`requestId`, `userId`, `jobId`).
* **Health Check Infrastructure**:
  - `GET /api/health/liveness`: Process liveness probe.
  - `GET /api/health/readiness`: Deep dependency readiness inspecting PostgreSQL, Job Queue, and Lab Provider states.
* **Production Packaging**: Unprivileged multi-stage `Dockerfile` running as `nextjs:nodejs` (UID 1001), `docker-compose.prod.yml`, and GitHub Actions CI workflow (`.github/workflows/ci.yml`).