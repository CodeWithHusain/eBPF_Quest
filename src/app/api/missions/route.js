import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { missionService } from '@/services/missionService';
import { getUserMissionsStatus } from '@/lib/db/missions';

export const dynamic = 'force-dynamic';

/**
 * GET /api/missions
 * Returns the missions catalog with user status if authenticated.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'ALL';
    const difficulty = searchParams.get('difficulty') || 'ALL';

    let missions = await missionService.getPublishedMissions();

    if (category !== 'ALL') {
      missions = missions.filter(
        (m) => m.category.toUpperCase() === category.toUpperCase()
      );
    }

    if (difficulty !== 'ALL') {
      missions = missions.filter(
        (m) => m.difficulty.toUpperCase() === difficulty.toUpperCase()
      );
    }

    const session = await getServerSession(authOptions);
    let userStatuses = {};

    if (session?.user?.id) {
      userStatuses = await getUserMissionsStatus(session.user.id);
    }

    const missionsWithStatus = missions.map((m) => {
      const userState = userStatuses[m.slug];
      return {
        ...m,
        userStatus: userState ? userState.status : 'NOT_STARTED',
      };
    });

    return NextResponse.json(
      { missions: missionsWithStatus },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API /api/missions GET] Error:', error.message);
    return NextResponse.json(
      { error: 'Failed to retrieve missions.' },
      { status: 500 }
    );
  }
}
