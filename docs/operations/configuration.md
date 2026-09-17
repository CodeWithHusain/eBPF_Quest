# BPFQuest Configuration & Secrets Management

This document defines all runtime configuration options, environment variables, security profiles, and secret rotation guidelines.

---

## 1. Environment Variables Reference

| Variable | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Yes | `development` | Runtime environment (`development`, `test`, `production`). |
| `DATABASE_URL` | Yes | - | PostgreSQL connection URL (`postgresql://user:pass@host:5432/dbname?schema=public`). |
| `NEXTAUTH_URL` | Yes | `http://localhost:3000` | Canonical public URL of the application. |
| `NEXTAUTH_SECRET` | Yes | - | Cryptographic secret for signing session JWT tokens (min 32 characters). |
| `GITHUB_ID` | Optional | - | GitHub OAuth Client ID for social login. |
| `GITHUB_SECRET` | Optional | - | GitHub OAuth Client Secret. |
| `MOCK_EXECUTION` | Optional | `true` | When `true`, execution engine safely mocks lab responses without container host interaction. |
| `PORT` | Optional | `3000` | HTTP port on which the web application listens. |
| `HOSTNAME` | Optional | `0.0.0.0` | Host interface binding. |

---

## 2. Secrets Management & Generation

### Generating `NEXTAUTH_SECRET`
Never use trivial or committed strings in production. Generate cryptographically strong random secrets:

```bash
# On Linux / macOS / WSL
openssl rand -base64 32

# On Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### GitHub OAuth Setup
1. Visit **GitHub Settings > Developer Settings > OAuth Apps**.
2. Set Homepage URL to: `https://your-domain.com` (or `http://localhost:3000` in dev).
3. Set Authorization callback URL to: `https://your-domain.com/api/auth/callback/github`.
4. Copy Client ID and generate a Client Secret.

---

## 3. Rate Limit Tuning

Default rate limit constants can be adjusted in `src/lib/security/rateLimiter.js`:

- `AUTH_REGISTER`: 5 requests / 60 seconds per IP.
- `AUTH_LOGIN`: 10 requests / 60 seconds per IP.
- `MISSION_SUBMIT`: 15 requests / 60 seconds per user/IP.
- `EXECUTION_CREATE`: 10 requests / 60 seconds per user/IP.
- `PROFILE_UPDATE`: 10 requests / 60 seconds per user/IP.
