import { NextResponse } from 'next/server';
import { defaultJobQueue } from '@/services/execution/jobQueue';
import { defaultLabOrchestrator } from '@/services/labs/labOrchestrator';

export const dynamic = 'force-dynamic';

/**
 * GET /api/execution/health
 * Safe health check reporting runner state, active queue depth, and provider availability.
 * CRITICAL: Zero user code executed.
 */
export async function GET() {
  try {
    const queueStats = defaultJobQueue.getStats();
    const provider = await defaultLabOrchestrator.resolveProvider();

    return NextResponse.json({
      status: 'HEALTHY',
      runner: {
        id: provider.id,
        name: provider.name,
      },
      queue: queueStats,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      {
        status: 'DEGRADED',
        error: err.message,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}