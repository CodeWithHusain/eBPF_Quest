# BPFQuest Threat Model & Security Architecture

This document formalizes the threat model, trust boundaries, threat analysis (STRIDE), and mitigations for the BPFQuest learning platform.

---

## 1. System Overview & Trust Boundaries

```text
┌─────────────────────────────────────────────────────────────┐
│ Untrusted Zone: Browser & User Input                        │
│ - Malicious C / eBPF source code                            │
│ - Malformed HTTP parameters / XSS payloads                  │
│ - Brute-force credentials & registration spam               │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS + Rate Limiting
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Semi-Trusted Zone: BPFQuest Application Server (Next.js)   │
│ - NextAuth authentication & session verification            │
│ - Input validation & ExecutionPolicy enforcement            │
│ - Server-side XP & Achievement engine                       │
│ - Structured logging & secret scrubbing                     │
└──────────────┬───────────────────────────────┬──────────────┘
               │ Internal Network              │ Strict RPC / Queue
               ▼                               ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│ Trusted Storage: PostgreSQL  │ │ Isolated Lab Runner Sandbox│
│ - User accounts & passwords  │ │ - Container / MicroVM      │
│ - Progress & XP audit ledger │ │ - No host Docker socket    │
│ - Cascading constraints      │ │ - Dropped capabilities     │
│                              │ │ - Internal network only    │
└──────────────────────────────┘ └────────────────────────────┘
```

---

## 2. STRIDE Threat Analysis

### A. Spoofing Identity
- **Threat**: Attacker impersonates another user to steal progress or tamper with profiles.
- **Mitigation**:
  - Secure HTTP-only cookies with `SameSite=Lax` for JWT sessions.
  - Constant-time password verification via `bcryptjs` (cost factor 10).
  - All mutating endpoints (`/api/user/profile`, `/api/execution`, `/api/missions/[slug]/submit`) extract `userId` strictly from the cryptographically verified server session, never trusting client parameters.

### B. Tampering with Data
- **Threat**: Client modifies XP balances, forces achievement unlocks, or injects malicious database records.
- **Mitigation**:
  - No client-supplied XP or badge values exist anywhere in the API contracts.
  - Gamification events (XP, Streaks, Achievements) are evaluated and committed server-side within atomic database transactions.
  - Unique compound database constraints (`[userId, sourceType, sourceId, rewardType]` and `[userId, achievementId]`) prevent replay attacks and duplicate awards.
  - Parameterized queries via Prisma ORM prevent SQL injection.

### C. Repudiation
- **Threat**: User denies actions or malicious attempts cannot be attributed.
- **Mitigation**:
  - Structured JSON logging (`logger.js`) with unique correlation IDs (`requestId`, `jobId`, `userId`).
  - Immutable `XPTransaction` ledger logs every point awarded along with its timestamp, source type, and unique source identifier.
  - Audit logging of all execution job transitions and validation outcomes.

### D. Information Disclosure
- **Threat**: Leakage of database credentials, OAuth client secrets, internal server paths, or other users' private execution outputs (IDOR).
- **Mitigation**:
  - Strict IDOR authorization: Execution jobs can only be retrieved by their owner (`job.userId === session.user.id`).
  - `sanitizeOutput()` and `sanitizeLogData()` redact database connection strings, JWT secrets, and sensitive tokens automatically before logging or response serialization.
  - Next.js HTTP security headers: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Content-Security-Policy`.

### E. Denial of Service (DoS)
- **Threat**: Exhausting server CPU/memory with endless loop eBPF programs, fork bombs, giant source payloads, or registration flood attacks.
- **Mitigation**:
  - Sliding-window rate limiting on registration (5/min), execution (10/min), and missions (15/min).
  - Strict input size limits: Maximum 50KB source code buffer.
  - Sandboxed execution bounds: Max 256MB RAM, 1 vCPU, 64 PIDs, and 10–15s hard server-side timeout watchdog.
  - Bounded job queue concurrency (max 2 jobs per user, max 10 concurrent globally).

### F. Elevation of Privilege
- **Threat**: Container breakout, kernel exploitation via eBPF bytecode, or hijacking the host machine via the Docker daemon.
- **Mitigation**:
  - **ZERO host code execution**: Web app host never compiles or runs user-submitted code.
  - **No Docker socket exposure**: Under no circumstances is `/var/run/docker.sock` accessible to user containers.
  - **Ephemeral Clean-room Execution**: Disposable container instances wiped after each run.
  - **Least Privilege**: Application container runs as unprivileged user `nextjs` (UID 1001), not root.
