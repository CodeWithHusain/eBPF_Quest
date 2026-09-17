import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { startMissionAttempt } from '@/lib/db/missions';
import { allMissionsMap } from '@/services/missionService';

/**
 * POST /api/missions/[slug]/start
 * Transitions a mission into IN_PROGRESS for the authenticated user.
 */
export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized. Please sign in to start a mission.' },
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

  try {
    const result = await startMissionAttempt(session.user.id, slug);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to start mission.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Mission attempt started.',
        missionSlug: slug,
        status: result.status,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`[API /api/missions/${slug}/start] Error:`, error.message);
    return NextResponse.json(
      { error: 'Failed to start mission.' },
      { status: 500 }
    );
  }
}
