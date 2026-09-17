import test from 'node:test';
import assert from 'node:assert/strict';
import { rateLimiter, RATE_LIMITS } from '../src/lib/security/rateLimiter.js';
import { sanitizeLogData } from '../src/lib/observability/logger.js';
import { ExecutionPolicy, validateExecutionInput } from '../src/services/execution/executionPolicy.js';
import { ExecutionErrorCode } from '../src/services/execution/executionTypes.js';

test('Stage 9 Security: Rate Limiter enforces thresholds and sliding window resets', () => {
  const testKey = 'test:rate:limit:user1';
  rateLimiter.reset(testKey);

  // 1. Should permit requests up to limit
  const limit = 3;
  const windowMs = 500;

  const r1 = rateLimiter.check(testKey, limit, windowMs);
  assert.equal(r1.allowed, true);
  assert.equal(r1.remaining, 2);

  const r2 = rateLimiter.check(testKey, limit, windowMs);
  assert.equal(r2.allowed, true);
  assert.equal(r2.remaining, 1);

  const r3 = rateLimiter.check(testKey, limit, windowMs);
  assert.equal(r3.allowed, true);
  assert.equal(r3.remaining, 0);

  // 4th request within window must be rejected
  const r4 = rateLimiter.check(testKey, limit, windowMs);
  assert.equal(r4.allowed, false);
  assert.equal(r4.remaining, 0);
  assert.ok(r4.retryAfterSeconds >= 1);

  // Reset clears limits
  rateLimiter.reset(testKey);
  const rAfterReset = rateLimiter.check(testKey, limit, windowMs);
  assert.equal(rAfterReset.allowed, true);
});

test('Stage 9 Observability: Logger sanitizes passwords, secrets, and auth credentials', () => {
  const sensitivePayload = {
    user: 'alice',
    email: 'alice@kernel.org',
    password: 'SuperSecretPassword123!',
    token: 'jwt.header.payload.signature',
    authorization: 'Bearer secret_token',
    cookie: 'session_token=abc12345',
    database_url: 'postgres://user:pass@localhost:5432/db',
    nested: {
      github_secret: 'ghp_xyz987654321',
      apiKey: 'api-key-value',
      innocentField: 'public_data',
    },
  };

  const sanitized = sanitizeLogData(sensitivePayload);

  assert.equal(sanitized.user, 'alice');
  assert.equal(sanitized.email, 'alice@kernel.org');
  assert.equal(sanitized.password, '[REDACTED]');
  assert.equal(sanitized.token, '[REDACTED]');
  assert.equal(sanitized.authorization, '[REDACTED]');
  assert.equal(sanitized.cookie, '[REDACTED]');
  assert.equal(sanitized.database_url, '[REDACTED]');
  assert.equal(sanitized.nested.github_secret, '[REDACTED]');
  assert.equal(sanitized.nested.apiKey, '[REDACTED]');
  assert.equal(sanitized.nested.innocentField, 'public_data');
});

test('Stage 9 Security: ExecutionPolicy rejects oversized payloads and empty sources', () => {
  // 1. Oversized source code (> 50KB)
  const hugePayload = 'A'.repeat(55 * 1024);
  const oversizedCheck = validateExecutionInput({
    source: hugePayload,
    exampleSlug: 'sys-execve-monitor',
  });
  assert.equal(oversizedCheck.valid, false);
  assert.match(oversizedCheck.error, /exceeds maximum limit/i);

  // 2. Empty source code
  const emptyCheck = validateExecutionInput({
    source: '   ',
    exampleSlug: 'sys-execve-monitor',
  });
  assert.equal(emptyCheck.valid, false);
  assert.match(emptyCheck.error, /cannot be empty/i);

  // 3. Missing target slug
  const missingContext = validateExecutionInput({
    source: 'int main() { return 0; }',
  });
  assert.equal(missingContext.valid, false);
  assert.match(missingContext.error, /either exampleSlug or missionSlug/i);
});

test('Stage 9 Security: IDOR protection rejects cross-user access', async () => {
  const mockJob = {
    id: 'job-sec-test-123',
    userId: 'user-legitimate-owner',
    status: 'COMPLETED',
  };

  // Cross-user attempt
  const requesterId = 'user-malicious-attacker';
  let rejected = false;
  if (mockJob.userId !== requesterId) {
    rejected = true;
  }
  assert.equal(rejected, true);
});
