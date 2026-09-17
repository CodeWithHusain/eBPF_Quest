import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { updateUserProfile } from '@/lib/db/users';
import { rateLimiter, getClientIp, RATE_LIMITS } from '@/lib/security/rateLimiter';
import { logger } from '@/lib/observability/logger';
import crypto from 'crypto';

export async function PUT(request) {
  const requestId = crypto.randomUUID();
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized. Please sign in.' },
      { status: 401 }
    );
  }

  // Rate Limiting per user
  const clientIp = getClientIp(request);
  const rateKey = `profile_update:${session.user.id}:${clientIp}`;
  const rateStatus = rateLimiter.check(
    rateKey,
    RATE_LIMITS.PROFILE_UPDATE.max,
    RATE_LIMITS.PROFILE_UPDATE.windowMs
  );

  if (!rateStatus.allowed) {
    logger.warn('Profile update rate limit exceeded', {
      requestId,
      userId: session.user.id,
    });
    return NextResponse.json(
      { error: 'Too many profile updates. Please wait a moment before trying again.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateStatus.retryAfterSeconds),
        },
      }
    );
  }

  const reqLogger = logger.child({
    requestId,
    userId: session.user.id,
    endpoint: '/api/user/profile',
  });

  try {
    const body = await request.json();
    const { name, username, bio } = body || {};

    reqLogger.info('Updating user profile', { username });

    const result = await updateUserProfile(session.user.id, {
      name,
      username,
      bio,
    });

    if (!result.success) {
      reqLogger.warn('Profile update validation error', { error: result.error });
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    reqLogger.info('Profile updated successfully');

    return NextResponse.json(
      { message: 'Profile updated successfully.', user: result.user },
      { status: 200 }
    );
  } catch (error) {
    reqLogger.error('Failed to update profile', { error: error.message });
    return NextResponse.json(
      { error: 'Failed to update profile.' },
      { status: 500 }
    );
  }
}
