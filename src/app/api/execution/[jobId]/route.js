import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { defaultExecutionService } from '@/services/execution/executionService';
import { ExecutionErrorCode } from '@/services/execution/executionTypes';

export const dynamic = 'force-dynamic';

/**
 * GET /api/execution/[jobId]
 * Retrieves sanitized status and output of an execution job.
 */
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { jobId } = params;
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID required.' }, { status: 400 });
    }

    const job = await defaultExecutionService.getJobStatus(jobId, session.user.id);
    if (!job) {
      return NextResponse.json({ error: 'Execution job not found.' }, { status: 404 });
    }

    return NextResponse.json(job, { status: 200 });
  } catch (error) {
    if (error.code === ExecutionErrorCode.FORBIDDEN) {
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
    }

    console.error(`[API /api/execution/${params?.jobId}] Error:`, error.message);
    return NextResponse.json({ error: 'Failed to retrieve job status.' }, { status: 500 });
  }
}