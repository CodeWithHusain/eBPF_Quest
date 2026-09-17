import React from 'react';
import { notFound } from 'next/navigation';
import { playgroundService, allPlaygroundExamplesMap } from '@/services/playgroundService';
import PlaygroundIDE from '@/components/playground/PlaygroundIDE';

export async function generateMetadata({ params }) {
  const example = await playgroundService.getExampleBySlug(params.example);
  if (!example) return { title: 'Playground Example Not Found — BPFQuest' };
  return {
    title: `${example.title} — eBPF Playground — BPFQuest`,
    description: example.shortDescription,
  };
}

export default async function PlaygroundExamplePage({ params }) {
  const { example } = params;
  const targetExample = allPlaygroundExamplesMap[example];

  if (!targetExample) {
    notFound();
  }

  const allExamples = await playgroundService.getExamples();
  const groupedCategories = await playgroundService.getExamplesByCategory();

  return (
    <main>
      <PlaygroundIDE
        initialExample={targetExample}
        allExamples={allExamples}
        groupedCategories={groupedCategories}
      />
    </main>
  );
}
