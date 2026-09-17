import test from 'node:test';
import assert from 'node:assert';
import { contentService } from '../src/services/contentService.js';
import { siteConfig } from '../src/config/site.js';
import { navConfig } from '../src/config/navigation.js';

test('contentService: should return all 8 curriculum courses', async () => {
  const courses = await contentService.getCourses();
  assert.ok(Array.isArray(courses));
  assert.strictEqual(courses.length, 8);
  assert.strictEqual(courses[0].slug, 'linux-fundamentals');
  assert.strictEqual(courses[0].difficulty, 'BEGINNER');
  assert.strictEqual(courses[0].isPublished, true);
  
  // Verify planned courses are present
  const xdpCourse = courses.find((c) => c.slug === 'xdp-express-data-path');
  assert.ok(xdpCourse);
  assert.strictEqual(xdpCourse.difficulty, 'ADVANCED');
  assert.strictEqual(xdpCourse.isPublished, false);
});

test('contentService: should return course by slug', async () => {
  const course = await contentService.getCourseBySlug('linux-fundamentals');
  assert.ok(course);
  assert.strictEqual(course.slug, 'linux-fundamentals');
  assert.ok(course.modules.length > 0);

  const xdp = await contentService.getCourseBySlug('xdp-express-data-path');
  assert.ok(xdp);

  const nonExistent = await contentService.getCourseBySlug('non-existent');
  assert.strictEqual(nonExistent, null);
});

test('contentService: should return lesson by slug with complete schema', async () => {
  const lesson = await contentService.getLessonBySlug('intro-to-linux');
  assert.ok(lesson);
  assert.strictEqual(lesson.slug, 'intro-to-linux');
  assert.strictEqual(lesson.difficulty, 'BEGINNER');
  assert.ok(Array.isArray(lesson.prerequisites));
  assert.ok(Array.isArray(lesson.objectives));
  assert.ok(typeof lesson.content === 'string');
  assert.ok(Array.isArray(lesson.codeExamples));
  assert.ok(lesson.challenge);
  assert.strictEqual(lesson.challenge.correctAnswer, '%rax');
  assert.ok(Array.isArray(lesson.resources));
});

test('contentService: should return tracks overview for all 8 courses', async () => {
  const tracks = await contentService.getTracksOverview();
  assert.ok(Array.isArray(tracks));
  assert.strictEqual(tracks.length, 8);
});

test('config: siteConfig and navConfig should be properly defined', () => {
  assert.strictEqual(siteConfig.name, 'BPFQuest');
  assert.ok(siteConfig.tagline);
  assert.ok(Array.isArray(navConfig.mainNav));
  assert.ok(navConfig.mainNav.some((item) => item.href === '/learn'));
  assert.ok(navConfig.mainNav.some((item) => item.href === '/missions'));
  assert.ok(navConfig.mainNav.some((item) => item.href === '/playground'));
  assert.ok(navConfig.mainNav.some((item) => item.href === '/docs'));

  // Test Section 15 footer columns
  assert.ok(Array.isArray(navConfig.footerNav.learn));
  assert.ok(Array.isArray(navConfig.footerNav.platform));
  assert.ok(Array.isArray(navConfig.footerNav.community));
  assert.ok(Array.isArray(navConfig.footerNav.legal));
});
