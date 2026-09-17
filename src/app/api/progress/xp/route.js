import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { xpService } from '@/services/gamification/xpService';
import { streakService } from '@/services/gamification/streakService';
import { achievementService } from '@/services/gamification/achievementService';

export const dynamic = 'force-dynamic';

/**
 * GET /api/progress/xp
 * Returns authenticated user's XP progress, level, quest rank, and transaction history.
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const userId = session.user.id;
    const [xpInfo, history, streak, achievements] = await Promise.all([
      xpService.getUserXP(userId),
      xpService.getXPHistory(userId, 50, 0),
      streakService.getUserStreak(userId),
      achievementService.getUserAchievements(userId),
    ]);

    const unlockedCount = achievements.filter((a) => a.isUnlocked).length;

    return NextResponse.json({
      xp: xpInfo,
      streak,
      history,
      achievementsCount: {
        unlocked: unlockedCount,
        total: achievements.length,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('[API /api/progress/xp] Error:', error.message);
    return NextResponse.json({ error: 'Failed to retrieve progress data.' }, { status: 500 });
  }
}