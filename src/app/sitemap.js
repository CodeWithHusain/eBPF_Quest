import { siteConfig } from '@/config/site';
import { allCurriculumCourses } from '@/services/contentService';
import { allLessonsMap } from '@/services/contentService';
import { allMissions } from '@/services/missionService';
import { allPlaygroundExamples } from '@/services/playgroundService';

export default async function sitemap() {
  const baseUrl = siteConfig.url || 'https://bpfquest.org';
  const lastModified = new Date();

  // Static core routes
  const staticRoutes = [
    '',
    '/learn',
    '/missions',
    '/playground',
    '/labs',
    '/docs',
    '/privacy',
    '/security',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Courses
  const courseRoutes = allCurriculumCourses.map((c) => ({
    url: `${baseUrl}/learn/${c.slug}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Canonical Lessons
  const lessonRoutes = Object.values(allLessonsMap).map((l) => ({
    url: `${baseUrl}/learn/${l.courseSlug}/${l.slug}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // Missions
  const missionRoutes = allMissions.map((m) => ({
    url: `${baseUrl}/missions/${m.slug}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // Playground Examples
  const playgroundRoutes = allPlaygroundExamples.map((ex) => ({
    url: `${baseUrl}/playground/${ex.slug}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...courseRoutes,
    ...lessonRoutes,
    ...missionRoutes,
    ...playgroundRoutes,
  ];
}
