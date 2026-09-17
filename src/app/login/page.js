import React, { Suspense } from 'react';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import LoginForm from '@/components/auth/LoginForm';
import LoadingState from '@/components/ui/LoadingState';

export const metadata = {
  title: 'Sign In — BPFQuest',
  description: 'Sign in to your BPFQuest account to access your learning dashboard and kernel quests.',
};

export default function LoginPage() {
  return (
    <Section spacing="xl">
      <Container size="narrow">
        <Suspense fallback={<LoadingState message="Loading login..." />}>
          <LoginForm />
        </Suspense>
      </Container>
    </Section>
  );
}
