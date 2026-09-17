import React, { Suspense } from 'react';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import SignupForm from '@/components/auth/SignupForm';
import LoadingState from '@/components/ui/LoadingState';

export const metadata = {
  title: 'Sign Up — BPFQuest',
  description: 'Create a BPFQuest account to start your journey into Linux and eBPF.',
};

export default function SignupPage() {
  return (
    <Section spacing="xl">
      <Container size="narrow">
        <Suspense fallback={<LoadingState message="Loading registration..." />}>
          <SignupForm />
        </Suspense>
      </Container>
    </Section>
  );
}
