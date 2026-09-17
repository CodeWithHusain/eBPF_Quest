import React from 'react';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { requireAuth } from '@/lib/auth/session';
import styles from './settings.module.css';

export const metadata = {
  title: 'Settings — BPFQuest',
  description: 'Manage your BPFQuest account, appearance, and security settings.',
};

export default async function SettingsPage() {
  const user = await requireAuth('/settings');

  return (
    <div className={styles.page}>
      <PageHeader
        title="Settings"
        description="Manage your account details, interface preferences, and authentication security."
        badgeText="PREFERENCES"
        badgeVariant="cyan"
        breadcrumbs={[{ title: 'Home', href: '/' }, { title: 'Dashboard', href: '/dashboard' }, { title: 'Settings' }]}
      />

      <Section spacing="lg">
        <Container size="narrow">
          <div className={styles.settingsLayout}>
            {/* 1. Account Section */}
            <Card variant="bordered" className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Account Details</h2>
                <p className={styles.sectionSubtitle}>Your primary account credentials and handles.</p>
              </div>

              <div className={styles.detailList}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Username</span>
                  <span className={styles.detailValue}>{user.username || 'Not set'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Email Address</span>
                  <span className={styles.detailValue}>{user.email || 'No email associated'}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Display Name</span>
                  <span className={styles.detailValue}>{user.name || user.username || 'Engineer'}</span>
                </div>
              </div>

              <div className={styles.actionRow}>
                <Button variant="outline" size="sm" href="/profile">
                  Edit Profile Information →
                </Button>
              </div>
            </Card>

            {/* 2. Appearance Section */}
            <Card variant="bordered" className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Appearance</h2>
                <p className={styles.sectionSubtitle}>Platform visual theme and terminal aesthetics.</p>
              </div>

              <div className={styles.themeRow}>
                <div className={styles.themeOption}>
                  <div className={styles.themeDot} />
                  <div>
                    <span className={styles.themeName}>Dark-First Terminal (Default)</span>
                    <p className={styles.themeDesc}>
                      Engineered for low-light developer workflows with high-contrast amber/cyan/emerald accents.
                    </p>
                  </div>
                </div>
                <Badge variant="emerald" size="sm">Active</Badge>
              </div>
            </Card>

            {/* 3. Security Section */}
            <Card variant="bordered" className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Security & Sessions</h2>
                <p className={styles.sectionSubtitle}>Authentication session and credentials.</p>
              </div>

              <div className={styles.detailList}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Authentication Type</span>
                  <span className={styles.detailValue}>
                    {user.passwordHash ? 'Email & Password' : 'OAuth Provider'}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Role Level</span>
                  <span className={styles.detailValue}>{user.role || 'STUDENT'}</span>
                </div>
              </div>

              <div className={styles.actionRow}>
                <Button variant="secondary" size="sm" href="/api/auth/signout">
                  Sign Out of Account
                </Button>
              </div>
            </Card>

            {/* 4. Danger Zone (Honest representation as specified in Section 15) */}
            <Card variant="bordered" className={styles.dangerCard}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.dangerTitle}>Danger Zone</h2>
                <p className={styles.dangerSubtitle}>
                  Account deletion and data erasure workflows will be introduced alongside GDPR export tooling in Stage 8.
                </p>
              </div>
              <p className={styles.dangerNotice}>
                To request manual account removal prior to Stage 8, please contact <code className={styles.codeContact}>security@bpfquest.org</code>.
              </p>
            </Card>
          </div>
        </Container>
      </Section>
    </div>
  );
}
