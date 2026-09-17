# Production Deployment Guide

This guide covers deploying BPFQuest in a production environment using Docker Compose, a reverse proxy with automated TLS, and an isolated lab execution runner.

---

## Architecture Overview

A production BPFQuest deployment consists of four primary components:

```
[ Internet ]
     ↓ HTTPS (443)
[ TLS Reverse Proxy (Nginx / Caddy / Traefik) ]
     ↓ HTTP (3000)
[ Next.js Application Container (bpfquest-app) ]
     ├── PostgreSQL Database (Port 5432, internal network)
     └── Sandboxed Lab Execution Runner (Docker socket or gRPC)
```

---

## 1. Prerequisites

- **Host Operating System**: Linux (Ubuntu 22.04 LTS or 24.04 LTS recommended) with kernel ≥ 5.15.
- **Docker**: Engine version 24.0+ and Docker Compose v2.
- **Hardware**: Minimum 2 vCPUs, 4GB RAM, 20GB SSD. (8GB+ recommended if running high concurrency lab sandboxes).
- **Domain**: DNS A/AAAA record pointing to your host IP.

---

## 2. Environment Configuration

Create a production `.env` file in the project root:

```env
# Application Settings
NODE_ENV=production
PORT=3000
NEXTAUTH_URL=https://bpfquest.example.com
NEXTAUTH_SECRET=generate_with_openssl_rand_hex_32

# PostgreSQL Database
DATABASE_URL=postgresql://bpfquest:STRONG_DB_PASSWORD@postgres:5432/bpfquest_prod?schema=public

# Lab Execution Infrastructure
# Options: 'container' (for live sandboxed runner) or 'mock' (for preview deployments)
LAB_PROVIDER=container
LAB_EXECUTION_TIMEOUT_MS=15000
LAB_MAX_CONCURRENT_JOBS=10

# OAuth Credentials (Optional)
GITHUB_ID=your_github_oauth_client_id
GITHUB_SECRET=your_github_oauth_client_secret

# Logging & Observability
LOG_LEVEL=info
```

Generate the `NEXTAUTH_SECRET`:
```bash
openssl rand -hex 32
```

---

## 3. Database Initialization & Migration

Before launching the web service, execute Prisma migrations against the production database:

```bash
# Run migrations using Prisma
npx prisma migrate deploy
```

If you wish to populate initial achievement definitions or test fixtures:
```bash
npm run db:seed
```

---

## 4. Docker Compose Deployment

Use the production `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: bpfquest
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: bpfquest_prod
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - internal-net

  app:
    build:
      context: .
      dockerfile: Dockerfile
    restart: unless-stopped
    ports:
      - "127.0.0.1:3000:3000"
    environment:
      - DATABASE_URL=postgresql://bpfquest:${POSTGRES_PASSWORD}@postgres:5432/bpfquest_prod?schema=public
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - LAB_PROVIDER=${LAB_PROVIDER}
    depends_on:
      - postgres
    networks:
      - internal-net

volumes:
  pgdata:

networks:
  internal-net:
    driver: bridge
```

Start the services:
```bash
docker compose up -d --build
```

---

## 5. Reverse Proxy Configuration (Nginx Example)

Configure Nginx with automated TLS via Certbot:

```nginx
server {
    listen 80;
    server_name bpfquest.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name bpfquest.example.com;

    ssl_certificate /etc/letsencrypt/live/bpfquest.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/bpfquest.example.com/privkey.pem;

    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 6. Health Checks & Monitoring

- **Application Health Check**: `GET /api/health` returns `200 OK` with status `healthy`, database connectivity, and timestamp.
- **Labs Engine Status**: `GET /labs` displays live runner availability, memory ceilings, and active execution mode.
- **Log Inspection**: Stream structured JSON application logs with:
  ```bash
  docker compose logs -f app
  ```
