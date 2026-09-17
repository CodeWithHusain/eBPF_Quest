'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, getProviders } from 'next-auth/react';
import styles from './AuthForm.module.css';
import Button from '@/components/ui/Button';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoNotice, setInfoNotice] = useState('');
  const [githubConfigured, setGithubConfigured] = useState(true);

  useEffect(() => {
    // Check for NextAuth URL error params
    const urlError = searchParams.get('error');
    if (urlError === 'Configuration') {
      setError(
        'GitHub OAuth credentials are not set on this server. Please register and sign in using Email or Username below, or configure GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in .env.'
      );
    } else if (urlError === 'OAuthSignin' || urlError === 'OAuthCallback') {
      setError('GitHub authentication encountered an issue. Please verify your GitHub OAuth App settings.');
    } else if (urlError === 'AccessDenied') {
      setError('Access was denied by GitHub. Please try again.');
    } else if (urlError === 'CredentialsSignin') {
      setError('Invalid email/username or password. Please check your credentials.');
    }

    // Check if redirected after registration
    if (searchParams.get('registered') === 'true') {
      setInfoNotice('Account created successfully! Please sign in with your credentials.');
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
    setInfoNotice('');

    if (!identifier.trim() || !password) {
      setError('Please enter your email/username and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await signIn('credentials', {
        identifier: identifier.trim(),
        password,
        redirect: false,
        callbackUrl,
      });

      if (res?.error) {
        setError('Invalid credentials. Please check your username and password.');
      } else if (res?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setError('');
    setInfoNotice('');

    if (!githubConfigured) {
      setError(
        'GitHub OAuth is not configured on this instance. To enable it, create a GitHub OAuth App and add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to your .env file. In the meantime, you can sign in or create an account with email/username and password below!'
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
        <span className={styles.terminalPrompt}>&gt;_ AUTH:LOGIN</span>
        <h1 className={styles.title}>Welcome back.</h1>
        <p className={styles.subtitle}>
          Continue your journey into Linux and eBPF.
        </p>
      </div>

      {infoNotice && (
        <div className={styles.infoBanner} role="status">
          <span>ℹ️ {infoNotice}</span>
        </div>
      )}

      {error && (
        <div className={styles.errorBanner} role="alert">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* GitHub OAuth Button */}
      <button
        type="button"
        className={styles.githubBtn}
        onClick={handleGitHubLogin}
        disabled={oauthLoading || loading}
        title={!githubConfigured ? 'GitHub OAuth credentials not set in .env' : 'Sign in with GitHub'}
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

      {/* Credentials Form */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="login-identifier" className={styles.label}>
            Email or Username
          </label>
          <input
            id="login-identifier"
            type="text"
            className={styles.input}
            placeholder="linus or engineer@kernel.org"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            autoComplete="username"
            required
            disabled={loading}
          />
        </div>

        <div className={styles.formGroup}>
          <div className={styles.labelRow}>
            <label htmlFor="login-password" className={styles.label}>
              Password
            </label>
          </div>
          <input
            id="login-password"
            type="password"
            className={styles.input}
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            disabled={loading}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={loading || oauthLoading}
        >
          {loading ? 'Authenticating...' : 'Sign In →'}
        </Button>
      </form>

      <div className={styles.footer}>
        <p className={styles.footerText}>
          Don&apos;t have an account?{' '}
          <Link href={`/signup${callbackUrl !== '/dashboard' ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`} className={styles.footerLink}>
            Create one for free
          </Link>
        </p>
      </div>
    </div>
  );
}
