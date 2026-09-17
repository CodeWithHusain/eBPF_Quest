# Security Policy & Lab Security Model

## Core Security Principles

BPFQuest is designed to teach low-level Linux internals, eBPF, and kernel programming. Because users submit code that interacts with Linux and kernel interfaces, security is integrated into every layer from the ground up.

---

### 1. Authentication & Session Security (Stage 3)

* **Mature Libraries**: All authentication flows are managed via [NextAuth.js (Auth.js)](https://next-auth.js.org/) and `bcryptjs`. Custom cryptography implementations are explicitly avoided.
* **Password Hashing**: Passwords are salted and hashed using bcrypt with a work factor of 10. Passwords are never stored in plaintext, logged, or exposed in database query projections.
* **Session Cookies**: Session tokens reside in encrypted, HTTP-only, secure cookies with `SameSite=Lax` protection against Cross-Site Request Forgery (CSRF).
* **Server-Side Authorization**: Protected routes (`/dashboard`, `/profile`, `/settings`) validate sessions server-side using cryptographic JWT signature verification and direct database lookups. Client-side storage (`localStorage`) is never trusted for authorization.
* **Defense Against User Enumeration**: Authentication failure endpoints return uniform, generic error responses (*"Invalid credentials"*) rather than indicating whether an email or username exists.
* **Username Sanitization & Namespace Reservation**: System handles (`admin`, `root`, `bpfquest`, `system`, `api`, etc.) are blocked at the validation layer to prevent impersonation.

---

### 2. Lab Security Model & Isolated Execution (Stage 7)

#### Threat Model & Trust Boundaries
* **Trusted Components**:
  * BPFQuest Web Application, NextAuth authentication layer, PostgreSQL database.
  * Job Queue and dedicated Execution Worker process.
  * Version-controlled lab Dockerfiles and templates (`labs/`).
  * Objective validation rules and scoring mechanisms.
* **Untrusted Components**:
  * User-submitted C / eBPF source code.
  * User-provided payload parameters, arguments, or shell commands.
  * All browser-originating requests and headers.

#### Critical Invariants
1. **Zero Host Code Execution**: User code is NEVER compiled, linked, or executed on the web server, database server, or host orchestration node.
2. **No Host Docker Socket Exposure**: Under no circumstances is `/var/run/docker.sock` mounted or reachable from user workloads.
3. **No Host Filesystem Mounts**: User workloads operate in ephemeral, clean-room container/microVM filesystems. Host `/`, `/home`, SSH keys, or cloud credentials are never mounted.
4. **No Network Access (Network Egress Disabled)**: Lab runners default to `--network none` (or internal Docker network without gateway egress).
5. **No Blind `--privileged` Execution**: Containers do not run as unrestricted privileged root. Default Linux capabilities are dropped (`ALL`). MicroVM hardware sandboxes are required for full `CAP_BPF` kernel interaction.
6. **No Secrets in Sandbox**: Database credentials, NextAuth secrets, and OAuth client keys are excluded by an explicit environment variable allowlist.
7. **Hard Resource Limits**:
   * CPU: 1 vCPU max.
   * Memory: 256MB max.
   * PIDs: 64 processes max (anti-forkbomb).
   * Execution Timeout: Hard timeout at 10–15 seconds enforced via server-side watchdog.
   * Output Limit: Maximum 64KB buffer cap; oversized stdout/stderr is truncated.
8. **Guaranteed Ephemeral Cleanup**: Every lab session is cleaned up and deallocated via a `finally` block upon completion, failure, timeout, or user cancellation. Expired labs are reaped by background processes.

---

### 3. Input Validation & Defense-in-Depth

* All parameters, slugs, IDs, and payload bodies passed to server endpoints must undergo strict sanitization and schema validation (see `src/lib/validation/` and `src/services/execution/executionPolicy.js`).
* Slugs must match strict alphanumeric hyphenated patterns `^[a-z0-9]+(?:-[a-z0-9]+)*$` to prevent path traversal and injection.
* Database operations use parameterized queries exclusively through Prisma ORM to prevent SQL injection vulnerabilities.
* Source code sizes are strictly capped at 50KB.

---

### 4. Security Hardening, Rate Limiting & Observability (Stage 9)

* **HTTP Security Headers**: Enforced across all routes via `next.config.mjs`:
  * `Content-Security-Policy`: Restricts script, style, connection, and web worker execution scopes.
  * `Strict-Transport-Security`: `max-age=63072000; includeSubDomains; preload`
  * `X-Frame-Options: DENY`: Prevents clickjacking framing attacks.
  * `X-Content-Type-Options: nosniff`: Prevents MIME-type sniffing vulnerabilities.
  * `Referrer-Policy: strict-origin-when-cross-origin`: Controls referrer data leakage.
  * `Permissions-Policy`: Blocks unauthorized sensor and camera access.
* **Sliding Window Rate Limiting**: Built-in memory rate limiter (`src/lib/security/rateLimiter.js`) protects authentication, registration, mission evaluation, and lab execution endpoints against brute-force and DoS attacks.
* **Automated Secret Redaction**: Structured logger (`src/lib/observability/logger.js`) scrubs sensitive keys (`password`, `token`, `secret`, `authorization`, `database_url`) automatically from all audit traces and console streams.
* **Non-Root Container Hardening**: Production Docker image runs under unprivileged user `nextjs:nodejs` (UID 1001) with multi-stage build minimization.

---

### 5. Incident Response & Reporting a Vulnerability

If you discover a potential security vulnerability in BPFQuest, please **do not** report it publicly via GitHub Issues.

Instead, please send a detailed disclosure to:
* **Security Contact**: `security@bpfquest.org` (or open a private GitHub Security Advisory)

Include:
* Description of the vulnerability
* Steps to reproduce or proof-of-concept
* Potential impact

We appreciate responsible disclosure and will acknowledge receipt within 48 hours.