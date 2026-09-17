import React from 'react';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ProfileEditor from '@/components/auth/ProfileEditor';
import { requireAuth } from '@/lib/auth/session';
import styles from './profile.module.css';

export const metadata = {
  title: 'Profile — BPFQuest',
  description: 'Your BPFQuest engineer profile and identity.',
};

export default async function ProfilePage() {
  const user = await requireAuth('/profile');

  const displayName = user.name || user.username || 'Engineer';
  const username = user.username ? `@${user.username}` : user.email;
  const joinedDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className={styles.page}>
      <PageHeader
        title="Engineer Profile"
        description="Manage your public handle, display name, and systems engineering bio."
        badgeText="ACCOUNT IDENTITY"
        badgeVariant="cyan"
        breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Dashboard', href: '/dashboard' }, { title: 'Profile' }]}
      />

      <Section spacing="lg">
        <Container size="narrow">
          <div className={styles.profileLayout}>
            {/* Identity Card */}
            <Card variant="bordered" className={styles.identityCard}>
              <div className={styles.cardHeader}>
                <div className={styles.avatar}>
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.image} alt={displayName} className={styles.avatarImg} />
                  ) : (
                    <span>{displayName.charAt(0).toUpperCase()}</span>
                  )}
                </div>

                <div className={styles.identityMeta}>
                  <div className={styles.nameRow}>
                    <h2 className={styles.displayName}>{displayName}</h2>
                    <Badge variant="cyan" size="sm">{user.role || 'STUDENT'}</Badge>
                  </div>
                  <span className={styles.username}>{username}</span>
                  <span className={styles.memberSince}>Member since {joinedDate}</span>
                </div>
              </div>

              {user.bio ? (
                <div className={styles.bioBlock}>
                  <p className={styles.bioText}>{user.bio}</p>
                </div>
              ) : (
                <div className={styles.emptyBioBlock}>
                  <span>No bio provided yet. Add one below to share your systems focus.</span>
                </div>
              )}
            </Card>

            {/* Edit Profile Form */}
            <Card variant="bordered" className={styles.editorCard}>
              <h3 className={styles.editorHeading}>Edit Account Profile</h3>
              <ProfileEditor initialUser={user} />
            </Card>

            {/* Settings Quick Link */}
            <div className={styles.quickNav}>
              <Button variant="ghost" size="sm" href="/settings">
                ⚙️ View Account Settings →
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
