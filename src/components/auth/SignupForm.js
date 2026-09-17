'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, getProviders } from 'next-auth/react';
import styles from './AuthForm.module.css';
import Button from '@/components/ui/Button';

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState('');
  const [githubConfigured, setGithubConfigured] = useState(true);

  useEffect(() => {
    // Check for NextAuth URL error params
    const urlError = searchParams.get('error');
    if (urlError === 'Configuration') {
      setError(
        'GitHub OAuth credentials are not set on this server. Please create an account using Email/Username and Password below, or configure GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in .env.'
      );
    } else if (urlError === 'OAuthSignin' || urlError === 'OAuthCallback') {
      setError('GitHub authentication encountered an issue. Please verify your GitHub OAuth App settings.');
    } else if (urlError === 'AccessDenied') {
      setError('Access was denied by GitHub. Please try again.');
    }

    // Check if GitHub provider is configured
    getProviders()
      .then((providers) => {
        setGithubConfigured(Boolean(providers?.github));
      })
      .catch(() => {
        setGithubConfigured(false);
      });
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password,
          name: name.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create account. Please try again.');
        setLoading(false);
        return;
      }

      // Automatically sign in upon successful registration
      const loginRes = await signIn('credentials', {
        identifier: username.trim(),
        password,
        redirect: false,
        callbackUrl,
      });

      if (loginRes?.ok) {
        router.push(callbackUrl);
        router.refresh();
      } else {
        router.push('/login?registered=true');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleGitHubSignup = async () => {
    setError('');

    if (!githubConfigured) {
      setError(
        'GitHub OAuth is not configured on this instance. To enable it, register an OAuth App on GitHub and add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to your .env file. In the meantime, you can create your account below with username and password!'
      );
      return;
    }

    setOauthLoading(true);
    try {
      await signIn('github', { callbackUrl });
    } catch (err) {
      setError('GitHub authentication failed. Please try again.');
      setOauthLoading(false);
    }
  };

  return (
    <div className={styles.formCard}>
      <div className={styles.header}>
        <span className={styles.terminalPrompt}>&gt;_ AUTH:REGISTER</span>
        <h1 className={styles.title}>Join BPFQuest</h1>
        <p className={styles.subtitle}>
          Start your journey into Linux and eBPF.
        </p>
      </div>

      {error && (
        <div className={styles.errorBanner} role="alert">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* GitHub OAuth Button */}
      <button
        type="button"
        className={styles.githubBtn}
        onClick={handleGitHubSignup}
        disabled={oauthLoading || loading}
        title={!githubConfigured ? 'GitHub OAuth credentials not set in .env' : 'Sign up with GitHub'}
      >
        <svg
          className={styles.githubIcon}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          />
        </svg>
        <span>
          {oauthLoading
            ? 'Connecting to GitHub...'
            : !githubConfigured
            ? 'GitHub OAuth (Configure in .env)'
            : 'Continue with GitHub'}
        </span>
      </button>

      <div className={styles.divider}>
        <span className={styles.dividerLine} />
        <span className={styles.dividerText}>OR</span>
        <span className={styles.dividerLine} />
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="signup-username" className={styles.label}>
            Username <span className={styles.required}>*</span>
          </label>
          <input
            id="signup-username"
            type="text"
            className={styles.input}
            placeholder="e.g. torvalds_99"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
            disabled={loading}
          />
          <span className={styles.hint}>3–30 characters, letters, numbers, and underscores only.</span>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="signup-email" className={styles.label}>
            Email <span className={styles.required}>*</span>
          </label>
          <input
            id="signup-email"
            type="email"
            className={styles.input}
            placeholder="you@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            disabled={loading}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="signup-name" className={styles.label}>
            Display Name
          </label>
          <input
            id="signup-name"
            type="text"
            className={styles.input}
            placeholder="Linus Torvalds"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            disabled={loading}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="signup-password" className={styles.label}>
            Password <span className={styles.required}>*</span>
          </label>
          <input
            id="signup-password"
            type="password"
            className={styles.input}
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            disabled={loading}
          />
          <span className={styles.hint}>Minimum 8 characters with at least one letter and one number.</span>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={loading || oauthLoading}
        >
          {loading ? 'Creating Account...' : 'Create Account →'}
        </Button>
      </form>

      <div className={styles.footer}>
        <p className={styles.footerText}>
          Already have an account?{' '}
          <Link href={`/login${callbackUrl !== '/dashboard' ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`} className={styles.footerLink}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
