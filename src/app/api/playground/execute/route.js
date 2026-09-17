import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { defaultPlaygroundExecutor, ExecutionState } from '@/lib/execution/playgroundExecutor';

export const dynamic = 'force-dynamic';

/**
 * POST /api/playground/execute
 * Validates code and queries the executor service.
 * In Stage 6, returns a safe simulated response with clear Stage 7 readiness status.
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json().catch(() => ({}));
    const { exampleSlug, source } = body;

    if (!source || typeof source !== 'string') {
      return NextResponse.json(
        {
          status: ExecutionState.FAILED,
          error: 'Source code is required.',
        },
        { status: 400 }
      );
    }

    const result = await defaultPlaygroundExecutor.execute({
      exampleSlug: exampleSlug || 'custom',
      source,
      userId: session?.user?.id || null,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('[API /api/playground/execute] Error:', error.message);
    return NextResponse.json(
      {
        status: ExecutionState.FAILED,
        error: 'Failed to process execution request.',
      },
      { status: 500 }
    );
  }
}
