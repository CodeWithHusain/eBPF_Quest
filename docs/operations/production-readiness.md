# BPFQuest Production Readiness & Operations Runbook

This guide contains the pre-launch readiness verification checklist, monitoring thresholds, and operational runbooks for running BPFQuest in production.

---

## 1. Production Readiness Checklist

Before deploying BPFQuest to public infrastructure:

- [x] **Security Headers**: HSTS, CSP, X-Frame-Options, X-Content-Type-Options verified.
- [x] **Rate Limiting**: Sliding window protection enabled for authentication, execution, and submissions.
- [x] **Health Checks**: `/api/health/liveness` and `/api/health/readiness` endpoints operational.
- [x] **Non-Root Execution**: Multi-stage Dockerfile drops root privileges to `nextjs:nodejs` (UID 1001).
- [x] **Lab Isolation**: Zero host code execution invariant confirmed; host Docker socket never mounted.
- [x] **Input Bounds**: Strict 50KB cap on user source code.
- [x] **No Secrets in Logs**: Sensitive fields scrubbed by `logger.js`.
- [x] **Database Constraints**: Composite unique keys enforce idempotency for XP and achievements.
- [x] **Automated Tests**: Unit, security, and e2e integration test suites passing.

---

## 2. Health Monitoring & Alerting Thresholds

| Endpoint / Metric | Normal Baseline | Warning Threshold | Critical Incident Threshold |
| :--- | :--- | :--- | :--- |
| `GET /api/health/liveness` | HTTP 200 (< 50ms) | HTTP 200 (> 500ms) | Status != 200 or connection refused |
| `GET /api/health/readiness`| HTTP 200 (all healthy) | HTTP 200 (degraded lab) | HTTP 503 (database connection failed) |
| Active Job Queue Size | 0–3 jobs | > 8 jobs | > 20 jobs sustained for 5 min |
| Container Memory Usage | < 400MB | > 700MB | > 900MB (OOM imminent) |
| Database Connection Pool | 2–5 connections | > 15 connections | Connection pool exhaustion (> 20) |

---

## 3. Incident Triage Runbooks

### Runbook A: Database Unreachable (`HTTP 503` on `/api/health/readiness`)
1. Check PostgreSQL container or service status:
   ```bash
   docker ps -a | grep bpfquest-db
   docker logs --tail 50 bpfquest-db
   ```
2. Verify host disk space has not been exhausted (`df -h`).
3. If PostgreSQL crashed due to OOM, scale container memory in `docker-compose.prod.yml` and restart:
   ```bash
   docker compose -f docker-compose.prod.yml restart db
   ```

### Runbook B: High Rate of `429 Too Many Requests`
1. Inspect application access logs for top calling IP addresses:
   ```bash
   docker logs bpfquest-web | grep "rate limit exceeded"
   ```
2. If genuine DDoS or brute-force attack is observed, block attacker IP at edge reverse proxy (e.g. Cloudflare or Nginx firewall).
3. If valid classroom/cohort traffic is triggering rate limits from behind a shared NAT, adjust `RATE_LIMITS` constants in `src/lib/security/rateLimiter.js`.
