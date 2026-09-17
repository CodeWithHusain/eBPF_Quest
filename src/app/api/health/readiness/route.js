import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { defaultJobQueue } from '@/services/execution/jobQueue';
import { defaultLabOrchestrator } from '@/services/labs/labOrchestrator';
import { logger } from '@/lib/observability/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    components: {
      database: { status: 'unknown' },
      jobQueue: { status: 'unknown' },
      labProvider: { status: 'unknown' },
    },
  };

  let allHealthy = true;

  // 1. Check Database connection
  try {
    // Quick lightweight query
    await prisma.$queryRaw`SELECT 1`;
    health.components.database = { status: 'healthy', provider: 'postgresql' };
  } catch (err) {
    logger.error('Health check database failure', { error: err.message });
    health.components.database = {
      status: 'unhealthy',
      error: 'Cannot reach PostgreSQL database',
    };
    allHealthy = false;
  }

  // 2. Check Job Queue
  try {
    const queueStats = defaultJobQueue.getStats();
    health.components.jobQueue = {
      status: 'healthy',
      maxConcurrent: queueStats.maxConcurrent,
      activeJobs: queueStats.active,
      queuedJobs: queueStats.queued,
    };
  } catch (err) {
    health.components.jobQueue = { status: 'unhealthy', error: err.message };
    allHealthy = false;
  }

  // 3. Check Lab Provider
  try {
    const provider = await defaultLabOrchestrator.resolveProvider();
    health.components.labProvider = {
      status: 'healthy',
      providerId: provider.id,
      name: provider.name,
    };
  } catch (err) {
    health.components.labProvider = { status: 'unhealthy', error: err.message };
    allHealthy = false;
  }

  health.status = allHealthy ? 'healthy' : 'degraded';

  const statusCode = allHealthy ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}
