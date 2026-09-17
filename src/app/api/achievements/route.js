import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { achievementService } from '@/services/gamification/achievementService';

export const dynamic = 'force-dynamic';

/**
 * GET /api/achievements
 * Returns all canonical achievements merged with user's unlock timestamps.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;

    const achievements = await achievementService.getUserAchievements(userId);

    return NextResponse.json({
      achievements,
      total: achievements.length,
      unlocked: achievements.filter((a) => a.isUnlocked).length,
    }, { status: 200 });
  } catch (error) {
    console.error('[API /api/achievements] Error:', error.message);
    return NextResponse.json({ error: 'Failed to retrieve achievements.' }, { status: 500 });
  }
}