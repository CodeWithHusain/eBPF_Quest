/**
 * Sliding Window In-Memory Rate Limiter
 * Provides abuse and DoS protection for authentication, execution, and sensitive endpoints.
 */

class RateLimiter {
  constructor() {
    this.windows = new Map();
    // Periodically clean up stale entries every 5 minutes
    if (typeof setInterval !== 'undefined') {
      const timer = setInterval(() => this.cleanup(), 5 * 60 * 1000);
      if (timer && timer.unref) timer.unref();
    }
  }

  /**
   * Check if a request identifier exceeds the rate limit.
   *
   * @param {string} identifier - e.g. IP address or userId:endpoint
   * @param {number} maxRequests - maximum allowed requests within the window
   * @param {number} windowMs - duration of sliding window in milliseconds (default: 60,000ms = 1m)
   * @returns {{ allowed: boolean, remaining: number, resetTimeMs: number, retryAfterSeconds: number }}
   */
  check(identifier, maxRequests = 10, windowMs = 60000) {
    const now = Date.now();
    const windowStart = now - windowMs;

    let timestamps = this.windows.get(identifier);
    if (!timestamps) {
      timestamps = [];
      this.windows.set(identifier, timestamps);
    }

    // Filter timestamps within current sliding window
    timestamps = timestamps.filter((t) => t > windowStart);
    this.windows.set(identifier, timestamps);

    if (timestamps.length >= maxRequests) {
      const oldest = timestamps[0];
      const resetTimeMs = oldest + windowMs;
      const retryAfterSeconds = Math.max(1, Math.ceil((resetTimeMs - now) / 1000));

      return {
        allowed: false,
        remaining: 0,
        resetTimeMs,
        retryAfterSeconds,
      };
    }

    // Record request timestamp
    timestamps.push(now);

    return {
      allowed: true,
      remaining: maxRequests - timestamps.length,
      resetTimeMs: now + windowMs,
      retryAfterSeconds: 0,
    };
  }

  /**
   * Reset limits for a specific identifier (useful in tests).
   */
  reset(identifier) {
    if (identifier) {
      this.windows.delete(identifier);
    } else {
      this.windows.clear();
    }
  }

  /**
   * Garbage-collect expired records
   */
  cleanup() {
    const now = Date.now();
    const maxWindow = 10 * 60 * 1000; // 10 minutes max window
    for (const [key, timestamps] of this.windows.entries()) {
      const valid = timestamps.filter((t) => now - t < maxWindow);
      if (valid.length === 0) {
        this.windows.delete(key);
      } else {
        this.windows.set(key, valid);
      }
    }
  }
}

// Global singleton instance
export const rateLimiter = new RateLimiter();

/**
 * Standard client IP extraction helper from Next.js Request
 */
export function getClientIp(req) {
  if (!req) return '127.0.0.1';

  // Standard reverse proxy headers
  const forwardedFor = req.headers?.get?.('x-forwarded-for') || req.headers?.['x-forwarded-for'];
  if (forwardedFor) {
    const ips = (typeof forwardedFor === 'string' ? forwardedFor : forwardedFor[0]).split(',');
    return ips[0].trim();
  }

  const realIp = req.headers?.get?.('x-real-ip') || req.headers?.['x-real-ip'];
  if (realIp) return typeof realIp === 'string' ? realIp : realIp[0];

  return '127.0.0.1';
}

/**
 * Rate limit configuration profiles
 */
export const RATE_LIMITS = {
  AUTH_REGISTER: { max: 5, windowMs: 60 * 1000 },       // 5 per minute
  AUTH_LOGIN: { max: 10, windowMs: 60 * 1000 },          // 10 per minute
  MISSION_SUBMIT: { max: 15, windowMs: 60 * 1000 },      // 15 per minute
  EXECUTION_CREATE: { max: 10, windowMs: 60 * 1000 },    // 10 per minute
  PROFILE_UPDATE: { max: 10, windowMs: 60 * 1000 },      // 10 per minute
};
