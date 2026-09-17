'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import styles from './UserNavMenu.module.css';

export default function UserNavMenu({ user }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const displayName = user?.name || user?.username || 'Engineer';
  const username = user?.username ? `@${user.username}` : user?.email;
  const initial = displayName.charAt(0).toUpperCase();

  // Close on click outside or escape key
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div className={styles.wrapper} ref={menuRef}>
      <button
        type="button"
        className={styles.triggerBtn}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="User account menu"
      >
        {user?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt={displayName} className={styles.avatarImg} />
        ) : (
          <span className={styles.avatarFallback}>{initial}</span>
        )}
        <span className={styles.chevron}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className={styles.dropdown} role="menu">
          <div className={styles.userInfo}>
            <span className={styles.userName}>{displayName}</span>
            <span className={styles.userHandle}>{username}</span>
          </div>

          <div className={styles.divider} />

          <ul className={styles.menuList}>
            <li role="none">
              <Link
                href="/dashboard"
                className={styles.menuItem}
                role="menuitem"
                onClick={() => setOpen(false)}
              >
                <span className={styles.itemIcon}>📊</span>
                <span>Dashboard</span>
              </Link>
            </li>
            <li role="none">
              <Link
                href="/progress"
                className={styles.menuItem}
                role="menuitem"
                onClick={() => setOpen(false)}
              >
                <span className={styles.itemIcon}>📈</span>
                <span>Progress</span>
              </Link>
            </li>
            <li role="none">
              <Link
                href="/achievements"
                className={styles.menuItem}
                role="menuitem"
                onClick={() => setOpen(false)}
              >
                <span className={styles.itemIcon}>🏆</span>
                <span>Achievements</span>
              </Link>
            </li>
            <li role="none">
              <Link
                href="/profile"
                className={styles.menuItem}
                role="menuitem"
                onClick={() => setOpen(false)}
              >
                <span className={styles.itemIcon}>👤</span>
                <span>Profile</span>
              </Link>
            </li>
            <li role="none">
              <Link
                href="/settings"
                className={styles.menuItem}
                role="menuitem"
                onClick={() => setOpen(false)}
              >
                <span className={styles.itemIcon}>⚙️</span>
                <span>Settings</span>
              </Link>
            </li>
          </ul>

          <div className={styles.divider} />

          <button
            type="button"
            className={styles.signOutBtn}
            role="menuitem"
            onClick={() => signOut({ callbackUrl: '/' })}
          >
            <span className={styles.itemIcon}>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
