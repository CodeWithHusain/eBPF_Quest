import { helloEbpfExample } from '../content/playground/hello-ebpf.js';
import { traceProcessExample } from '../content/playground/trace-process.js';
import { fileOpenExample } from '../content/playground/file-open.js';
import { countEventsExample } from '../content/playground/count-events.js';
import { networkEventsExample } from '../content/playground/network-events.js';
import { xdpIntroExample } from '../content/playground/xdp-intro.js';

export const allPlaygroundExamples = [
  helloEbpfExample,
  traceProcessExample,
  fileOpenExample,
  countEventsExample,
  networkEventsExample,
  xdpIntroExample,
];

export const allPlaygroundExamplesMap = {
  [helloEbpfExample.slug]: helloEbpfExample,
  [traceProcessExample.slug]: traceProcessExample,
  [fileOpenExample.slug]: fileOpenExample,
  [countEventsExample.slug]: countEventsExample,
  [networkEventsExample.slug]: networkEventsExample,
  [xdpIntroExample.slug]: xdpIntroExample,
};

export const playgroundService = {
  async getExamples() {
    return allPlaygroundExamples;
  },

  async getExampleBySlug(slug) {
    if (!slug) return allPlaygroundExamples[0];
    return allPlaygroundExamplesMap[slug] || null;
  },

  async getExamplesByCategory() {
    const grouped = {};
    for (const ex of allPlaygroundExamples) {
      if (!grouped[ex.category]) {
        grouped[ex.category] = [];
      }
      grouped[ex.category].push(ex);
    }
    return grouped;
  },
};

export default playgroundService;
