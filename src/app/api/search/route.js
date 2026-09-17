import { NextResponse } from 'next/server';
import { contentService, allCurriculumCourses } from '@/services/contentService';
import { allMissions } from '@/services/missionService';
import { allPlaygroundExamples } from '@/services/playgroundService';

export const dynamic = 'force-dynamic';

/**
 * GET /api/search?q=...
 * Fast in-memory search across courses, lessons, missions, playground examples, and documentation.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim().toLowerCase();

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] }, { status: 200 });
  }

  const results = [];

  // 1. Search Courses
  for (const course of allCurriculumCourses) {
    if (
      course.title.toLowerCase().includes(q) ||
      course.tagline?.toLowerCase().includes(q) ||
      course.description?.toLowerCase().includes(q)
    ) {
      results.push({
        type: 'course',
        title: course.title,
        description: course.tagline || course.description,
        category: course.difficulty,
        href: `/learn/${course.slug}`,
      });
    }
  }

  // 2. Search Lessons
  const allLessons = await contentService.getCourseLessons('linux-fundamentals');
  for (const lesson of allLessons) {
    if (
      lesson.title.toLowerCase().includes(q) ||
      lesson.description?.toLowerCase().includes(q) ||
      lesson.objectives?.some((obj) => obj.toLowerCase().includes(q))
    ) {
      results.push({
        type: 'lesson',
        title: lesson.title,
        description: lesson.description,
        category: 'Linux Fundamentals',
        href: `/learn/linux-fundamentals/${lesson.slug}`,
      });
    }
  }

  // 3. Search Missions
  for (const mission of allMissions) {
    if (
      mission.title.toLowerCase().includes(q) ||
      mission.description?.toLowerCase().includes(q) ||
      mission.category?.toLowerCase().includes(q)
    ) {
      results.push({
        type: 'mission',
        title: mission.title,
        description: mission.shortDescription || mission.description,
        category: mission.category,
        href: `/missions/${mission.slug}`,
      });
    }
  }

  // 4. Search Playground Examples
  for (const ex of allPlaygroundExamples) {
    if (
      ex.title.toLowerCase().includes(q) ||
      ex.shortDescription?.toLowerCase().includes(q) ||
      ex.category?.toLowerCase().includes(q)
    ) {
      results.push({
        type: 'playground',
        title: ex.title,
        description: ex.shortDescription,
        category: ex.category,
        href: `/playground/${ex.slug}`,
      });
    }
  }

  // 5. Search Documentation topics
  const docTopics = [
    { title: 'What is BPFQuest?', desc: 'Architecture, learning paths, and missions', href: '/docs#getting-started' },
    { title: 'Linux Architecture & Hardware Rings', desc: 'Ring 0 vs Ring 3 and syscall dispatching', href: '/docs#linux-fundamentals' },
    { title: 'eBPF Architecture & The Kernel Verifier', desc: 'ELF bytecode, verifier safety proofs, and maps', href: '/docs#ebpf-architecture' },
    { title: 'Interactive eBPF Playground Guide', desc: 'Writing probes, C syntax, and sample output', href: '/docs#playground-guide' },
    { title: 'Hands-On Challenges & Validation', desc: 'Missions, investigation commands, and scoring', href: '/docs#missions-guide' },
    { title: 'Lab Isolation & Security Invariants', desc: 'Zero host execution, resource limits, and network isolation', href: '/docs#labs-architecture' },
    { title: 'Contributing to BPFQuest', desc: 'How to add lessons, missions, and open PRs', href: '/docs#contributing-guide' },
  ];

  for (const doc of docTopics) {
    if (doc.title.toLowerCase().includes(q) || doc.desc.toLowerCase().includes(q)) {
      results.push({
        type: 'docs',
        title: doc.title,
        description: doc.desc,
        category: 'Documentation',
        href: doc.href,
      });
    }
  }

  return NextResponse.json({ results: results.slice(0, 10) }, { status: 200 });
}
