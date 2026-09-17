import React from 'react';
import { playgroundService } from '@/services/playgroundService';
import PlaygroundIDE from '@/components/playground/PlaygroundIDE';

export const metadata = {
  title: 'Interactive eBPF Playground — BPFQuest',
  description: 'Browser-based C and eBPF code editor, examples explorer, and execution sandbox preview.',
};

export default async function PlaygroundPage({ params }) {
  const exampleSlug = params?.example || 'hello-ebpf';
  const allExamples = await playgroundService.getExamples();
  const initialExample =
    (await playgroundService.getExampleBySlug(exampleSlug)) || allExamples[0];
  const groupedCategories = await playgroundService.getExamplesByCategory();

  return (
    <main>
      <PlaygroundIDE
        initialExample={initialExample}
        allExamples={allExamples}
        groupedCategories={groupedCategories}
      />
    </main>
  );
}
