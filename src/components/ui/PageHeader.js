import React from 'react';
import Link from 'next/link';
import styles from './PageHeader.module.css';
import Container from './Container';
import Badge from './Badge';
import { cn } from '@/lib/utils/cn';

/**
 * Standard page header component for main sections and subpages.
 * 
 * @param {Object} props
 * @param {string} props.title
 * @param {string} [props.description]
 * @param {string} [props.badgeText]
 * @param {'default'|'cyan'|'emerald'|'orange'|'purple'} [props.badgeVariant='cyan']
 * @param {Array<{title: string, href?: string}>} [props.breadcrumbs]
 * @param {React.ReactNode} [props.actions]
 * @param {string} [props.className]
 */
export default function PageHeader({
  title,
  description,
  badgeText,
  badgeVariant = 'cyan',
  breadcrumbs = [],
  actions,
  className = '',
}) {
  return (
    <div className={cn(styles.wrapper, className)}>
      <Container>
        {breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
            <ol className={styles.breadcrumbList}>
              {breadcrumbs.map((crumb, idx) => (
                <li key={idx} className={styles.breadcrumbItem}>
                  {idx > 0 && <span className={styles.separator}>/</span>}
                  {crumb.href ? (
                    <Link href={crumb.href} className={styles.crumbLink}>
                      {crumb.title}
                    </Link>
                  ) : (
                    <span className={styles.crumbCurrent} aria-current="page">
                      {crumb.title}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className={styles.headerContent}>
          <div className={styles.titles}>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>{title}</h1>
              {badgeText && (
                <Badge variant={badgeVariant} size="md">
                  {badgeText}
                </Badge>
              )}
            </div>
            {description && <p className={styles.description}>{description}</p>}
          </div>

          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      </Container>
    </div>
  );
}
