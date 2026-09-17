import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import {
  getUserCourseProgress,
  markLessonComplete,
} from '@/lib/db/learning';
import { allLessonsMap } from '@/services/contentService';

/**
 * GET /api/progress?courseSlug=...
 * Returns the authenticated user's progress for a course.
 */
export async function GET(request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized. Please sign in to view progress.' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const courseSlug = searchParams.get('courseSlug');

  if (!courseSlug) {
    return NextResponse.json(
      { error: 'courseSlug query parameter is required.' },
      { status: 400 }
    );
  }

  try {
    const progress = await getUserCourseProgress(session.user.id, courseSlug);
    return NextResponse.json({ progress }, { status: 200 });
  } catch (error) {
    console.error('[API /api/progress GET] Error:', error.message);
    return NextResponse.json(
      { error: 'Failed to retrieve course progress.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/progress
 * Body: { lessonSlug: string, completed: boolean }
 * Marks a lesson complete or incomplete for the authenticated user.
 */
export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized. Please sign in to save progress.' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { lessonSlug, completed = true } = body;

    if (!lessonSlug || typeof lessonSlug !== 'string') {
      return NextResponse.json(
        { error: 'Valid lessonSlug is required.' },
        { status: 400 }
      );
    }

    const lessonMeta = allLessonsMap[lessonSlug];
    if (!lessonMeta) {
      return NextResponse.json(
        { error: `Lesson '${lessonSlug}' does not exist.` },
        { status: 404 }
      );
    }

    const result = await markLessonComplete(
      session.user.id,
      lessonSlug,
      Boolean(completed)
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to update progress.' },
        { status: 500 }
      );
    }

    // Return updated course progress alongside completion status
    const courseProgress = await getUserCourseProgress(
      session.user.id,
      lessonMeta.courseSlug
    );

    return NextResponse.json(
      {
        message: completed
          ? 'Lesson marked as completed.'
          : 'Lesson marked as incomplete.',
        lessonSlug,
        isCompleted: result.isCompleted,
        courseProgress,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API /api/progress POST] Error:', error.message);
    return NextResponse.json(
      { error: 'Failed to update lesson progress.' },
      { status: 500 }
    );
  }
}
