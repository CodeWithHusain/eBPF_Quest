import { NextResponse } from 'next/server';
import { createUser } from '@/lib/db/users';
import { rateLimiter, getClientIp, RATE_LIMITS } from '@/lib/security/rateLimiter';
import { logger } from '@/lib/observability/logger';
import crypto from 'crypto';

export async function POST(request) {
  const requestId = crypto.randomUUID();
  const reqLogger = logger.child({ requestId, endpoint: '/api/auth/register' });

  // Rate Limiting
  const clientIp = getClientIp(request);
  const rateKey = `register:${clientIp}`;
  const rateStatus = rateLimiter.check(
    rateKey,
    RATE_LIMITS.AUTH_REGISTER.max,
    RATE_LIMITS.AUTH_REGISTER.windowMs
  );

  if (!rateStatus.allowed) {
    reqLogger.warn('Registration rate limit exceeded', { clientIp });
    return NextResponse.json(
      { error: 'Too many registration requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateStatus.retryAfterSeconds),
        },
      }
    );
  }

  try {
    const body = await request.json();
    const { email, username, password, name } = body || {};

    reqLogger.info('Processing user registration', { email, username });

    const result = await createUser({
      email,
      username,
      password,
      name,
    });

    if (!result.success) {
      reqLogger.warn('User registration validation failed', { error: result.error, username });
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    reqLogger.info('User registered successfully', { userId: result.user?.id, username });

    return NextResponse.json(
      { message: 'Account registered successfully.', user: result.user },
      { status: 201 }
    );
  } catch (error) {
    reqLogger.error('Server error during registration', { error: error.message });
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
