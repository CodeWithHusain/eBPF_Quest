'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styles from './ProfileEditor.module.css';
import Button from '@/components/ui/Button';

export default function ProfileEditor({ initialUser }) {
  const router = useRouter();
  const { update } = useSession();

  const [name, setName] = useState(initialUser.name || '');
  const [username, setUsername] = useState(initialUser.username || '');
  const [bio, setBio] = useState(initialUser.bio || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, bio }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to update profile.');
        setLoading(false);
        return;
      }

      setSuccess('Profile updated successfully.');
      // Trigger NextAuth session refresh
      await update({ name, username });
      router.refresh();
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {success && (
        <div className={styles.successBanner} role="status">
          ✓ {success}
        </div>
      )}

      {error && (
        <div className={styles.errorBanner} role="alert">
          ⚠️ {error}
        </div>
      )}

      <div className={styles.formGroup}>
        <label htmlFor="edit-username" className={styles.label}>
          Username
        </label>
        <input
          id="edit-username"
          type="text"
          className={styles.input}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={loading}
        />
        <span className={styles.hint}>Used for your engineer identity across BPFQuest.</span>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="edit-name" className={styles.label}>
          Display Name
        </label>
        <input
          id="edit-name"
          type="text"
          className={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="edit-bio" className={styles.label}>
          Bio / Systems Focus
        </label>
        <textarea
          id="edit-bio"
          className={styles.textarea}
          rows={3}
          placeholder="e.g. Systems engineer interested in Linux kernel tracing, eBPF packet processing, and observability."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          disabled={loading}
          maxLength={250}
        />
        <span className={styles.hint}>{bio.length} / 250 characters. Plain text only.</span>
      </div>

      <div className={styles.actionRow}>
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={loading}
        >
          {loading ? 'Saving Changes...' : 'Save Profile'}
        </Button>
      </div>
    </form>
  );
}
