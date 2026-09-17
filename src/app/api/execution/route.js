import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { defaultExecutionService } from '@/services/execution/executionService';
import { ExecutionErrorCode } from '@/services/execution/executionTypes';
import { rateLimiter, getClientIp, RATE_LIMITS } from '@/lib/security/rateLimiter';
import { logger } from '@/lib/observability/logger';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

/**
 * POST /api/execution
 * Authenticated entrypoint to enqueue an isolated lab execution job.
 */
export async function POST(request) {
  const requestId = crypto.randomUUID();
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to submit execution workloads.' },
        { status: 401 }
      );
    }

    // Rate Limiting
    const clientIp = getClientIp(request);
    const rateKey = `execution:${session.user.id}:${clientIp}`;
    const rateStatus = rateLimiter.check(
      rateKey,
      RATE_LIMITS.EXECUTION_CREATE.max,
      RATE_LIMITS.EXECUTION_CREATE.windowMs
    );

    if (!rateStatus.allowed) {
      logger.warn('Execution rate limit exceeded', {
        requestId,
        userId: session.user.id,
      });
      return NextResponse.json(
        { error: 'Execution rate limit exceeded. Please wait a moment before running again.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateStatus.retryAfterSeconds),
          },
        }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { source, exampleSlug, missionSlug } = body;

    logger.info('Enqueueing execution job', {
      requestId,
      userId: session.user.id,
      exampleSlug,
      missionSlug,
    });

    const result = await defaultExecutionService.submitJob({
      userId: session.user.id,
      source,
      exampleSlug,
      missionSlug,
    });

    return NextResponse.json(result, { status: 202 });
  } catch (error) {
    if (error.code === ExecutionErrorCode.RATE_LIMITED) {
      return NextResponse.json(
        { error: 'Execution rate limit exceeded. Please wait a moment before running again.' },
        { status: 429 }
      );
    }

    if (error.code === ExecutionErrorCode.RESOURCE_LIMIT) {
      return NextResponse.json(
        { error: 'Maximum concurrent execution jobs reached for your account.' },
        { status: 429 }
      );
    }

    if (error.code === ExecutionErrorCode.INVALID_REQUEST) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    logger.error('Unhandled execution submission error', {
      requestId,
      error: error.message,
    });
    return NextResponse.json(
      { error: 'Internal execution service error.' },
      { status: 500 }
    );
  }
}