'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styles from './Navbar.module.css';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Logo from '@/components/ui/Logo';
import UserNavMenu from '@/components/auth/UserNavMenu';
import SearchModal from '@/components/ui/SearchModal';
import { navConfig } from '@/config/navigation';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils/cn';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated' && session?.user;

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  return (
    <header className={styles.header}>
      <Container className={styles.navContainer}>
        {/* Brand Logo */}
        <div className={styles.brandRow}>
          <Logo size="md" />

          {/* Mobile hamburger button */}
          <button
            type="button"
            className={styles.mobileMenuButton}
            onClick={toggleMobileMenu}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            <span className={cn(styles.hamburger, mobileMenuOpen && styles.open)} />
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className={styles.desktopNav} aria-label="Main Navigation">
          <ul className={styles.navList}>
            {navConfig.mainNav.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`));
              return (
                <li key={item.href} className={styles.navItem}>
                  <Link
                    href={item.href}
                    className={cn(styles.navLink, isActive && styles.navLinkActive)}
                  >
                    {item.title}
                    {isActive && <span className={styles.activeIndicator} aria-hidden="true" />}
                  </Link>
                </li>
              );
            })}
            {isAuthenticated && (
              <>
                <li className={styles.navItem}>
                  <Link
                    href="/dashboard"
                    className={cn(styles.navLink, pathname === '/dashboard' && styles.navLinkActive)}
                  >
                    Dashboard
                    {pathname === '/dashboard' && <span className={styles.activeIndicator} aria-hidden="true" />}
                  </Link>
                </li>
                <li className={styles.navItem}>
                  <Link
                    href="/profile"
                    className={cn(styles.navLink, pathname === '/profile' && styles.navLinkActive)}
                  >
                    Profile
                    {pathname === '/profile' && <span className={styles.activeIndicator} aria-hidden="true" />}
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        {/* Desktop Actions */}
        <div className={styles.desktopActions}>
          <button
            type="button"
            id="bpfquest-search-btn"
            onClick={() => setSearchOpen(true)}
            style={{
              background: '#161b22',
              border: '1px solid #30363d',
              borderRadius: '6px',
              padding: '0.35rem 0.65rem',
              color: '#8b949e',
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
            aria-label="Search curriculum (Ctrl+K)"
          >
            <span>🔍</span>
            <span style={{ color: '#c9d1d9' }}>Search</span>
            <kbd style={{ background: '#21262d', padding: '0.1rem 0.3rem', borderRadius: '3px', fontSize: '0.7rem', color: '#8b949e' }}>Ctrl K</kbd>
          </button>

          <a
            href={siteConfig.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.githubLink}
            aria-label="GitHub Repository (opens in a new tab)"
          >
            <svg
              className={styles.githubIcon}
              width="18"
              height="18"
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
            <span className={styles.githubText}>GitHub</span>
          </a>

          {status === 'loading' ? (
            <div className={styles.authPlaceholder} />
          ) : isAuthenticated ? (
            <UserNavMenu user={session.user} />
          ) : (
            <div className={styles.anonActions}>
              <Button variant="outline" size="sm" href="/login">
                Sign In
              </Button>
              <Button variant="primary" size="sm" href="/signup">
                Start Quest
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div id="mobile-navigation" className={styles.mobileNav} role="region" aria-label="Mobile Navigation Drawer">
            <ul className={styles.mobileNavList}>
              {navConfig.mainNav.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(styles.mobileNavLink, isActive && styles.mobileNavLinkActive)}
                    >
                      <span>{item.title}</span>
                      {isActive && <span className={styles.mobileActiveDot} />}
                    </Link>
                  </li>
                );
              })}

              {isAuthenticated ? (
                <>
                  <li className={styles.mobileDivider} />
                  <li>
                    <Link href="/dashboard" className={styles.mobileNavLink}>
                      📊 Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link href="/profile" className={styles.mobileNavLink}>
                      👤 Profile
                    </Link>
                  </li>
                  <li>
                    <Link href="/settings" className={styles.mobileNavLink}>
                      ⚙️ Settings
                    </Link>
                  </li>
                  <li className={styles.mobileAction}>
                    <Button
                      variant="outline"
                      size="md"
                      fullWidth
                      href="/api/auth/signout"
                    >
                      Sign Out
                    </Button>
                  </li>
                </>
              ) : (
                <>
                  <li className={styles.mobileDivider} />
                  <li>
                    <Link href="/login" className={styles.mobileNavLink}>
                      Sign In
                    </Link>
                  </li>
                  <li className={styles.mobileAction}>
                    <Button variant="primary" size="md" fullWidth href="/signup">
                      Start Quest
                    </Button>
                  </li>
                </>
              )}

              <li className={styles.mobileDivider} />
              <li>
                <a
                  href={siteConfig.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.mobileNavLink}
                >
                  GitHub Repository ↗
                </a>
              </li>
            </ul>
          </div>
        )}
      </Container>

      {/* Global Search Modal (Ctrl+K) */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}

