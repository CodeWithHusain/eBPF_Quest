import test from 'node:test';
import assert from 'node:assert';
import { contentService, allLessonsMap } from '../src/services/contentService.js';
import { linuxFundamentalsCourse } from '../src/content/courses/linux-fundamentals.js';
import { getUserCourseProgress, markLessonComplete } from '../src/lib/db/learning.js';

test('Curriculum: Linux Fundamentals has 5 modules and 23 canonical lessons', async () => {
  assert.strictEqual(linuxFundamentalsCourse.slug, 'linux-fundamentals');
  assert.strictEqual(linuxFundamentalsCourse.modules.length, 5);

  const expectedModuleSlugs = [
    'linux-environment',
    'files-and-filesystems',
    'processes',
    'permissions',
    'networking-basics',
  ];

  const actualModuleSlugs = linuxFundamentalsCourse.modules.map((m) => m.slug);
  assert.deepStrictEqual(actualModuleSlugs, expectedModuleSlugs);

  // Check lesson counts per module: 5, 4, 5, 5, 5 => total 24 (intro + 23 canonical)
  const lessonCounts = linuxFundamentalsCourse.modules.map((m) => m.lessons.length);
  assert.deepStrictEqual(lessonCounts, [5, 4, 5, 5, 5]);

  const totalLessons = linuxFundamentalsCourse.modules.reduce(
    (acc, m) => acc + m.lessons.length,
    0
  );
  assert.strictEqual(totalLessons, 24);
});

test('Curriculum: Every lesson in Linux Fundamentals has a complete educational schema', async () => {
  const courseLessons = await contentService.getCourseLessons('linux-fundamentals');
  assert.ok(courseLessons.length >= 23);

  for (const lesson of courseLessons) {
    assert.ok(lesson.slug, 'Lesson must have slug');
    assert.ok(lesson.title, `Lesson ${lesson.slug} must have title`);
    assert.ok(lesson.description, `Lesson ${lesson.slug} must have description`);
    assert.ok(lesson.difficulty, `Lesson ${lesson.slug} must have difficulty`);
    assert.ok(typeof lesson.estimatedMinutes === 'number', `Lesson ${lesson.slug} must have estimatedMinutes`);
    assert.ok(Array.isArray(lesson.prerequisites), `Lesson ${lesson.slug} must have prerequisites`);
    assert.ok(Array.isArray(lesson.objectives), `Lesson ${lesson.slug} must have objectives`);
    assert.ok(typeof lesson.content === 'string' && lesson.content.length > 200, `Lesson ${lesson.slug} must have content`);
    assert.ok(lesson.knowledgeCheck, `Lesson ${lesson.slug} must have knowledgeCheck`);
    assert.ok(lesson.knowledgeCheck.prompt, `Knowledge check for ${lesson.slug} must have prompt`);
    assert.ok(lesson.knowledgeCheck.options.length >= 2, `Knowledge check for ${lesson.slug} must have options`);
    assert.ok(lesson.knowledgeCheck.explanation, `Knowledge check for ${lesson.slug} must have explanation`);
  }
});

test('Navigation: getNextAndPrevLessons returns proper sequential navigation', async () => {
  const first = await contentService.getNextAndPrevLessons('linux-fundamentals', 'what-is-linux');
  assert.strictEqual(first.prev, null);
  assert.ok(first.next);
  assert.strictEqual(first.next.slug, 'linux-distributions');

  const second = await contentService.getNextAndPrevLessons('linux-fundamentals', 'linux-distributions');
  assert.strictEqual(second.prev.slug, 'what-is-linux');
  assert.strictEqual(second.next.slug, 'terminal-fundamentals');

  const last = await contentService.getNextAndPrevLessons(
    'linux-fundamentals',
    'basic-linux-networking-tools'
  );
  assert.strictEqual(last.next, null);
  assert.strictEqual(last.prev.slug, 'tcp-and-udp');
});

test('Progress calculation: unauthenticated / guest returns zero progress without fabricating data', async () => {
  const guestProgress = await getUserCourseProgress(null, 'linux-fundamentals');
  assert.strictEqual(guestProgress.completedLessons, 0);
  assert.strictEqual(guestProgress.percentage, 0);
  assert.strictEqual(guestProgress.isCompleted, false);
  assert.deepStrictEqual(guestProgress.completedLessonSlugs, []);

  const invalidCourse = await getUserCourseProgress('some-user', 'non-existent-course');
  assert.strictEqual(invalidCourse.totalLessons, 0);
  assert.strictEqual(invalidCourse.completedLessons, 0);
  assert.strictEqual(invalidCourse.percentage, 0);
});

test('Security & Validation: markLessonComplete rejects missing or invalid inputs', async () => {
  const res1 = await markLessonComplete(null, 'what-is-linux');
  assert.strictEqual(res1.success, false);

  const res2 = await markLessonComplete('user-1', null);
  assert.strictEqual(res2.success, false);

  const res3 = await markLessonComplete('user-1', 'completely-fake-lesson-slug-xyz');
  assert.strictEqual(res3.success, false);
  assert.match(res3.error, /does not exist/);
});
