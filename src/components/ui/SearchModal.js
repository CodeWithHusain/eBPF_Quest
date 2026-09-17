'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Badge from '@/components/ui/Badge';
import styles from './SearchModal.module.css';

export default function SearchModal({ isOpen, onClose }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle Ctrl+K keyboard shortcut globally
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open via parent state
          const btn = document.getElementById('bpfquest-search-btn');
          if (btn) btn.click();
        }
      }

      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced query fetching
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
          setSelectedIndex(0);
        }
      } catch (err) {
        console.error('Search query failed:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      router.push(results[selectedIndex].href);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-label="Global Search">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.searchBar}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            ref={inputRef}
            type="text"
            className={styles.searchInput}
            placeholder="Search lessons, courses, missions, or eBPF docs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <kbd className={styles.escKey} onClick={onClose}>ESC</kbd>
        </div>

        <div className={styles.resultsList}>
          {loading && (
            <div className={styles.statusMessage}>Searching curriculum and missions...</div>
          )}

          {!loading && query.length >= 2 && results.length === 0 && (
            <div className={styles.statusMessage}>No matches found for &quot;{query}&quot;.</div>
          )}

          {!loading && query.length < 2 && (
            <div className={styles.quickTips}>
              <span style={{ color: '#8b949e', fontSize: '0.8rem' }}>Quick suggestions:</span>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <span className={styles.suggestionBadge} onClick={() => setQuery('process')}>process</span>
                <span className={styles.suggestionBadge} onClick={() => setQuery('syscall')}>syscall</span>
                <span className={styles.suggestionBadge} onClick={() => setQuery('ebpf')}>ebpf</span>
                <span className={styles.suggestionBadge} onClick={() => setQuery('xdp')}>xdp</span>
                <span className={styles.suggestionBadge} onClick={() => setQuery('proc')}>/proc</span>
              </div>
            </div>
          )}

          {results.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.resultItem} ${isSelected ? styles.resultSelected : ''}`}
                onClick={onClose}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span className={styles.itemTitle}>{item.title}</span>
                    <Badge
                      variant={
                        item.type === 'course'
                          ? 'cyan'
                          : item.type === 'lesson'
                          ? 'emerald'
                          : item.type === 'mission'
                          ? 'orange'
                          : item.type === 'playground'
                          ? 'purple'
                          : 'default'
                      }
                      size="sm"
                    >
                      {item.type.toUpperCase()}
                    </Badge>
                  </div>
                  <div className={styles.itemDesc}>{item.description}</div>
                </div>
                <span className={styles.enterArrow}>↵</span>
              </Link>
            );
          })}
        </div>

        <div className={styles.footer}>
          <span>Use <strong>↑</strong> <strong>↓</strong> to navigate, <strong>Enter</strong> to select</span>
        </div>
      </div>
    </div>
  );
}
