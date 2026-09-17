/**
 * Centralized Site Configuration for BPFQuest
 */

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'BPFQuest',
  tagline: 'Master Linux. Explore eBPF. Build at the Kernel Level.',
  description:
    'An open-source, hands-on learning platform for Linux internals, eBPF, kernel observability, tracing, networking, and security.',
  version: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  links: {
    github: 'https://github.com/bpfquest/bpfquest',
    docs: '/docs',
    community: 'https://github.com/bpfquest/bpfquest/discussions',
    twitter: 'https://twitter.com/bpfquest',
  },
  author: {
    name: 'BPFQuest Core Team & Contributors',
    url: 'https://github.com/bpfquest',
  },
  license: {
    name: 'Apache-2.0',
    url: 'https://github.com/bpfquest/bpfquest/blob/main/LICENSE',
  },
  metadata: {
    keywords: [
      'Linux',
      'eBPF',
      'Kernel Programming',
      'Observability',
      'Tracing',
      'BCC',
      'libbpf',
      'XDP',
      'CO-RE',
      'Systems Engineering',
      'Hands-on Labs',
    ],
  },
};

export default siteConfig;
