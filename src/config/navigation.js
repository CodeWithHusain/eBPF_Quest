/**
 * Centralized Navigation Configuration for BPFQuest
 */

export const navConfig = {
  mainNav: [
    {
      title: 'Learn',
      href: '/learn',
      description: 'Structured courses and modules on Linux internals and eBPF.',
    },
    {
      title: 'Missions',
      href: '/missions',
      description: 'Hands-on CTF-style challenges and practical kernel quests.',
    },
    {
      title: 'Playground',
      href: '/playground',
      description: 'Interactive scratchpad for eBPF programs and tracing probes.',
    },
    {
      title: 'Labs',
      href: '/labs',
      description: 'Ephemeral sandboxed Linux virtual environments.',
    },
    {
      title: 'Docs',
      href: '/docs',
      description: 'Reference documentation, kernel guides, and BPF maps cheat sheets.',
    },
  ],
  footerNav: {
    learn: [
      { title: 'Linux Fundamentals', href: '/learn' },
      { title: 'eBPF Fundamentals', href: '/learn' },
      { title: 'Kernel Tracing', href: '/learn' },
      { title: 'Linux Networking', href: '/learn' },
      { title: 'XDP (Data Path)', href: '/learn' },
    ],
    platform: [
      { title: 'Learn Curriculum', href: '/learn' },
      { title: 'Hands-on Missions', href: '/missions' },
      { title: 'eBPF Playground', href: '/playground' },
      { title: 'Sandboxed Labs', href: '/labs' },
      { title: 'Technical Docs', href: '/docs' },
    ],
    community: [
      { title: 'GitHub Repository', href: 'https://github.com/bpfquest/bpfquest', external: true },
      { title: 'Discussions', href: 'https://github.com/bpfquest/bpfquest/discussions', external: true },
      { title: 'Contributing Guide', href: 'https://github.com/bpfquest/bpfquest/blob/main/CONTRIBUTING.md', external: true },
    ],
    legal: [
      { title: 'Apache-2.0 License', href: 'https://github.com/bpfquest/bpfquest/blob/main/LICENSE', external: true },
      { title: 'Privacy Policy', href: '/privacy' },
      { title: 'Security Policy', href: '/security' },
    ],
  },
};

export default navConfig;
