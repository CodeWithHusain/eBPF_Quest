import { linuxFundamentalsCourse } from '../content/courses/linux-fundamentals.js';

// Module 1 Lessons
import { whatIsLinuxLesson } from '../content/lessons/what-is-linux.js';
import { linuxDistributionsLesson } from '../content/lessons/linux-distributions.js';
import { terminalFundamentalsLesson } from '../content/lessons/terminal-fundamentals.js';
import { shellBasicsLesson } from '../content/lessons/shell-basics.js';
import { workingWithCommandsLesson } from '../content/lessons/working-with-commands.js';

// Module 2 Lessons
import { filesystemHierarchyLesson } from '../content/lessons/filesystem-hierarchy.js';
import { pathsAndDirectoriesLesson } from '../content/lessons/paths-and-directories.js';
import { filesAndMetadataLesson } from '../content/lessons/files-and-metadata.js';
import { fileDescriptorsLesson } from '../content/lessons/file-descriptors.js';

// Module 3 Lessons
import { whatIsAProcessLesson } from '../content/lessons/what-is-a-process.js';
import { processIdsLesson } from '../content/lessons/process-ids.js';
import { parentAndChildProcessesLesson } from '../content/lessons/parent-and-child-processes.js';
import { signalsLesson } from '../content/lessons/signals.js';
import { processInspectionLesson } from '../content/lessons/process-inspection.js';

// Module 4 Lessons
import { usersAndGroupsLesson } from '../content/lessons/users-and-groups.js';
import { filePermissionsLesson } from '../content/lessons/file-permissions.js';
import { chmodLesson } from '../content/lessons/chmod.js';
import { chownLesson } from '../content/lessons/chown.js';
import { sudoLesson } from '../content/lessons/sudo.js';

// Module 5 Lessons
import { networkInterfacesLesson } from '../content/lessons/network-interfaces.js';
import { ipAddressesLesson } from '../content/lessons/ip-addresses.js';
import { portsLesson } from '../content/lessons/ports.js';
import { tcpAndUdpLesson } from '../content/lessons/tcp-and-udp.js';
import { basicLinuxNetworkingToolsLesson } from '../content/lessons/basic-linux-networking-tools.js';

// Backward compatibility
import { introToLinuxLesson } from '../content/lessons/intro-to-linux.js';

/**
 * Complete registry of all lessons indexed by slug
 */
export const allLessonsMap = {
  // Intro alias
  [introToLinuxLesson.slug]: introToLinuxLesson,

  // Module 1
  [whatIsLinuxLesson.slug]: whatIsLinuxLesson,
  [linuxDistributionsLesson.slug]: linuxDistributionsLesson,
  [terminalFundamentalsLesson.slug]: terminalFundamentalsLesson,
  [shellBasicsLesson.slug]: shellBasicsLesson,
  [workingWithCommandsLesson.slug]: workingWithCommandsLesson,

  // Module 2
  [filesystemHierarchyLesson.slug]: filesystemHierarchyLesson,
  [pathsAndDirectoriesLesson.slug]: pathsAndDirectoriesLesson,
  [filesAndMetadataLesson.slug]: filesAndMetadataLesson,
  [fileDescriptorsLesson.slug]: fileDescriptorsLesson,

  // Module 3
  [whatIsAProcessLesson.slug]: whatIsAProcessLesson,
  [processIdsLesson.slug]: processIdsLesson,
  [parentAndChildProcessesLesson.slug]: parentAndChildProcessesLesson,
  [signalsLesson.slug]: signalsLesson,
  [processInspectionLesson.slug]: processInspectionLesson,

  // Module 4
  [usersAndGroupsLesson.slug]: usersAndGroupsLesson,
  [filePermissionsLesson.slug]: filePermissionsLesson,
  [chmodLesson.slug]: chmodLesson,
  [chownLesson.slug]: chownLesson,
  [sudoLesson.slug]: sudoLesson,

  // Module 5
  [networkInterfacesLesson.slug]: networkInterfacesLesson,
  [ipAddressesLesson.slug]: ipAddressesLesson,
  [portsLesson.slug]: portsLesson,
  [tcpAndUdpLesson.slug]: tcpAndUdpLesson,
  [basicLinuxNetworkingToolsLesson.slug]: basicLinuxNetworkingToolsLesson,
};

export const allCurriculumCourses = [
  linuxFundamentalsCourse, // Real content: Linux Fundamentals (5 modules, 23 lessons)
  {
    id: 'course-linux-networking',
    slug: 'linux-networking',
    title: 'Linux Networking Architecture',
    tagline: 'Network namespaces, sockets, TCP/IP stack traversal, and routing tables.',
    description: 'Learn how packets travel through the Linux kernel stack, socket buffers (sk_buff), network interfaces, and virtual bridging.',
    difficulty: 'BEGINNER',
    estimatedTime: '3 hours',
    lessonsCount: 6,
    isPublished: false,
    status: 'PLANNED',
    modules: [],
  },
  {
    id: 'course-kernel-fundamentals',
    slug: 'kernel-fundamentals',
    title: 'Kernel Fundamentals',
    tagline: 'Memory management, task structs, and process scheduling.',
    description: 'Explore the monolithic kernel, CPU execution rings, interrupt handling, page tables, and virtual memory mapping.',
    difficulty: 'BEGINNER',
    estimatedTime: '4 hours',
    lessonsCount: 8,
    isPublished: false,
    status: 'PLANNED',
    modules: [],
  },
  {
    id: 'course-ebpf-fundamentals',
    slug: 'ebpf-fundamentals',
    title: 'eBPF Fundamentals',
    tagline: 'The in-kernel virtual machine, instruction verifier, and runtime hooks.',
    description: 'Understand the eBPF architecture, instruction registers, the verifier safety proof algorithm, and bytecode compilation.',
    difficulty: 'INTERMEDIATE',
    estimatedTime: '5 hours',
    lessonsCount: 10,
    isPublished: false,
    status: 'PLANNED',
    modules: [],
  },
  {
    id: 'course-ebpf-tracing',
    slug: 'ebpf-tracing',
    title: 'eBPF Tracing & Observability',
    tagline: 'Dynamic kprobes, uprobes, tracepoints, and perf buffers.',
    description: 'Attach probes to production kernel routines and userspace symbols to trace latencies and intercept system events without reboots.',
    difficulty: 'INTERMEDIATE',
    estimatedTime: '4 hours',
    lessonsCount: 8,
    isPublished: false,
    status: 'PLANNED',
    modules: [],
  },
  {
    id: 'course-ebpf-networking',
    slug: 'ebpf-networking',
    title: 'eBPF Networking & Traffic Control',
    tagline: 'tc (traffic control) filters, socket dispatch, and packet manipulation.',
    description: 'Programmatically classify, inspect, rewrite, and redirect network frames using tc-bpf and sockops programs.',
    difficulty: 'INTERMEDIATE',
    estimatedTime: '4 hours',
    lessonsCount: 8,
    isPublished: false,
    status: 'PLANNED',
    modules: [],
  },
  {
    id: 'course-xdp',
    slug: 'xdp-express-data-path',
    title: 'XDP (eXpress Data Path)',
    tagline: 'Ultra-low latency packet filtering directly at the NIC driver layer.',
    description: 'Learn the fastest programmable packet processing mechanism in the Linux kernel: bare-metal wire speed processing, XDP_DROP, and XDP_TX.',
    difficulty: 'ADVANCED',
    estimatedTime: '6 hours',
    lessonsCount: 12,
    isPublished: false,
    status: 'PLANNED',
    modules: [],
  },
  {
    id: 'course-core-libbpf',
    slug: 'core-and-libbpf',
    title: 'CO-RE & libbpf Programming',
    tagline: 'Compile Once – Run Everywhere with BTF (BPF Type Format).',
    description: 'Build enterprise-grade, portable eBPF applications using libbpf, BTF relocation records, and modern kernel skeleton headers.',
    difficulty: 'ADVANCED',
    estimatedTime: '5 hours',
    lessonsCount: 9,
    isPublished: false,
    status: 'PLANNED',
    modules: [],
  },
];

/**
 * Decoupled Content Service
 */
export const contentService = {
  async getCourses() {
    return allCurriculumCourses;
  },

  async getPublishedCourses() {
    return allCurriculumCourses.filter((c) => c.isPublished);
  },

  async getCourseBySlug(slug) {
    const course = allCurriculumCourses.find((c) => c.slug === slug);
    return course || null;
  },

  async getLessonBySlug(slug, courseSlug = null) {
    const lesson = allLessonsMap[slug];
    if (!lesson) return null;
    if (courseSlug && lesson.courseSlug !== courseSlug) {
      return null;
    }
    return lesson;
  },

  async getCourseLessons(courseSlug) {
    const course = await this.getCourseBySlug(courseSlug);
    if (!course || !course.modules) return [];

    const lessons = [];
    for (const mod of course.modules) {
      if (mod.lessons) {
        for (const lessonSummary of mod.lessons) {
          const fullLesson = allLessonsMap[lessonSummary.slug];
          if (fullLesson) {
            lessons.push(fullLesson);
          } else {
            lessons.push(lessonSummary);
          }
        }
      }
    }
    return lessons;
  },

  async getNextAndPrevLessons(courseSlug, lessonSlug) {
    const course = await this.getCourseBySlug(courseSlug);
    if (!course || !course.modules) {
      return { prev: null, next: null };
    }

    // Flatten all lesson summaries in module order
    const orderedLessons = [];
    for (const mod of course.modules) {
      if (mod.lessons) {
        for (const l of mod.lessons) {
          orderedLessons.push({
            slug: l.slug,
            title: l.title,
            moduleTitle: mod.title,
          });
        }
      }
    }

    const currentIndex = orderedLessons.findIndex((l) => l.slug === lessonSlug);
    if (currentIndex === -1) {
      return { prev: null, next: null };
    }

    const prev = currentIndex > 0 ? orderedLessons[currentIndex - 1] : null;
    const next =
      currentIndex < orderedLessons.length - 1
        ? orderedLessons[currentIndex + 1]
        : null;

    return { prev, next };
  },

  async getTracksOverview() {
    return allCurriculumCourses.map((c) => ({
      slug: c.slug,
      title: c.title,
      level: c.difficulty,
      modulesCount: c.modules?.length || 0,
      lessonsCount: c.lessonsCount || 0,
      status: c.isPublished ? 'AVAILABLE' : c.status || 'PLANNED',
    }));
  },
};

export default contentService;
