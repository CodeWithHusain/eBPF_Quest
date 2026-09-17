import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';
import Container from '@/components/ui/Container';
import Logo from '@/components/ui/Logo';
import { siteConfig } from '@/config/site';
import { navConfig } from '@/config/navigation';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.grid}>
          {/* Brand Col */}
          <div className={styles.brandCol}>
            <Logo size="md" />
            <p className={styles.tagline}>
              Open-source, hands-on learning platform for Linux internals, eBPF, kernel tracing, and systems security.
            </p>
            <div className={styles.licenseBadge}>
              <span>Released under </span>
              <a
                href={siteConfig.license.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.licenseLink}
              >
                Apache-2.0 License
              </a>
            </div>
          </div>

          {/* Learn Column */}
          <div className={styles.linksCol}>
            <h4 className={styles.colTitle}>Learn</h4>
            <ul className={styles.linksList}>
              {navConfig.footerNav.learn.map((link) => (
                <li key={link.title}>
                  <Link href={link.href} className={styles.link}>
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform Column */}
          <div className={styles.linksCol}>
            <h4 className={styles.colTitle}>Platform</h4>
            <ul className={styles.linksList}>
              {navConfig.footerNav.platform.map((link) => (
                <li key={link.title}>
                  <Link href={link.href} className={styles.link}>
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community Column */}
          <div className={styles.linksCol}>
            <h4 className={styles.colTitle}>Community</h4>
            <ul className={styles.linksList}>
              {navConfig.footerNav.community.map((link) => (
                <li key={link.title}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.link}
                    >
                      {link.title} ↗
                    </a>
                  ) : (
                    <Link href={link.href} className={styles.link}>
                      {link.title}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div className={styles.linksCol}>
            <h4 className={styles.colTitle}>Legal</h4>
            <ul className={styles.linksList}>
              {navConfig.footerNav.legal.map((link) => (
                <li key={link.title}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.link}
                    >
                      {link.title} ↗
                    </a>
                  ) : (
                    <Link href={link.href} className={styles.link}>
                      {link.title}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <div className={styles.bottomText}>
            © {currentYear} {siteConfig.name}. An open-source project for the systems engineering community.
          </div>
          <div className={styles.bottomMeta}>
            <span className={styles.versionBadge}>v{siteConfig.version}</span>
            <span className={styles.statusIndicator}>
              <span className={styles.statusDot} />
              Stage 2 Product UI
            </span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
