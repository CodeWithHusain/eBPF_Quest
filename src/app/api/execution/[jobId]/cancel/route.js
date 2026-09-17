import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { defaultExecutionService } from '@/services/execution/executionService';
import { ExecutionErrorCode } from '@/services/execution/executionTypes';

export const dynamic = 'force-dynamic';

/**
 * POST /api/execution/[jobId]/cancel
 * Authorizes user ownership and aborts running execution job.
 */
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { jobId } = params;
    const success = await defaultExecutionService.cancelJob(jobId, session.user.id);

    return NextResponse.json({ success, jobId }, { status: 200 });
  } catch (error) {
    if (error.code === ExecutionErrorCode.FORBIDDEN) {
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
    }

    return NextResponse.json({ error: 'Failed to cancel job.' }, { status: 500 });
  }
}