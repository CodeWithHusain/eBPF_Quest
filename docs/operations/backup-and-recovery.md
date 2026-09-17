# BPFQuest Database Backup & Disaster Recovery Guide

This guide establishes the backup procedures, recovery objectives, and restore testing runbooks for the BPFQuest PostgreSQL database.

---

## 1. Recovery Objectives

- **Recovery Point Objective (RPO)**: Maximum acceptable data loss is 1 hour (via daily full backup + hourly WAL archiving or automated snapshotting).
- **Recovery Time Objective (RTO)**: Full service restoration within 30 minutes of incident declaration.

---

## 2. Backup Procedures

### A. Logical Backups (`pg_dump`)
Logical backups export SQL statements suitable for disaster recovery or database migration across PostgreSQL versions.

```bash
# Export compressed plain text backup
pg_dump -h localhost -U bpfquest -d bpfquest_prod -F c -b -v -f /backups/bpfquest_$(date +%Y%m%d_%H%M%S).dump

# Encrypt backup using GPG
gpg --symmetric --cipher-algo AES256 /backups/bpfquest_*.dump
```

### B. Automated Docker Backup Cron Job
When running via `docker-compose.prod.yml`:

```bash
docker exec -t bpfquest-db pg_dump -U bpfquest -d bpfquest_prod -F c | gzip > /var/backups/bpfquest_$(date +%Y%m%d_%H%M%S).dump.gz
```

---

## 3. Disaster Recovery & Restore Runbook

### Step 1: Prepare Clean Target Database
```bash
# Terminate existing active connections
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'bpfquest_prod' AND pid <> pg_backend_pid();

# Drop and recreate database
DROP DATABASE bpfquest_prod;
CREATE DATABASE bpfquest_prod OWNER bpfquest;
```

### Step 2: Restore from Backup Archive
```bash
pg_restore -h localhost -U bpfquest -d bpfquest_prod -v -1 /backups/bpfquest_TARGET_DATE.dump
```

### Step 3: Verify Integrity & Prisma Sync
```bash
# Verify schema and table presence
npx prisma db push --skip-generate

# Run test suite against restored database
npm test
```
