import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { submitMissionAttempt } from '@/lib/db/missions';
import { allMissionsMap } from '@/services/missionService';
import { rateLimiter, getClientIp, RATE_LIMITS } from '@/lib/security/rateLimiter';
import { logger } from '@/lib/observability/logger';
import crypto from 'crypto';

/**
 * POST /api/missions/[slug]/submit
 * Evaluates a user submission via the safe mock validator and records results.
 */
export async function POST(request, { params }) {
  const requestId = crypto.randomUUID();
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized. Please sign in to submit a mission solution.' },
      { status: 401 }
    );
  }

  const { slug } = params;
  if (!slug || !allMissionsMap[slug]) {
    return NextResponse.json(
      { error: `Mission '${slug}' does not exist.` },
      { status: 404 }
    );
  }

  // Rate Limiting per user and IP
  const clientIp = getClientIp(request);
  const rateKey = `mission_submit:${session.user.id}:${clientIp}`;
  const rateStatus = rateLimiter.check(
    rateKey,
    RATE_LIMITS.MISSION_SUBMIT.max,
    RATE_LIMITS.MISSION_SUBMIT.windowMs
  );

  if (!rateStatus.allowed) {
    logger.warn('Mission submit rate limit exceeded', {
      requestId,
      userId: session.user.id,
      slug,
    });
    return NextResponse.json(
      { error: 'Too many mission submissions. Please wait a moment before trying again.' },
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
    missionSlug: slug,
    endpoint: `/api/missions/${slug}/submit`,
  });

  try {
    const body = await request.json().catch(() => ({}));
    reqLogger.info('Evaluating mission attempt');

    const result = await submitMissionAttempt(session.user.id, slug, body);

    if (!result.success) {
      reqLogger.warn('Mission attempt evaluation failed', { error: result.error });
      return NextResponse.json(
        { error: result.error || 'Failed to process submission.' },
        { status: 500 }
      );
    }

    reqLogger.info('Mission attempt evaluated', {
      passed: result.passed,
      status: result.status,
    });

    return NextResponse.json(
      {
        passed: result.passed,
        status: result.status,
        feedback: result.feedback,
        passedObjectives: result.passedObjectives,
      },
      { status: 200 }
    );
  } catch (error) {
    reqLogger.error('Unhandled exception in mission submission', { error: error.message });
    return NextResponse.json(
      { error: 'Failed to submit solution.' },
      { status: 500 }
    );
  }
}
