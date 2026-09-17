'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Badge from '@/components/ui/Badge';
import styles from './PlaygroundIDE.module.css';

// Dynamically import Monaco Editor without SSR
const Editor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: '#8b949e',
        fontFamily: 'monospace',
      }}
    >
      Loading Monaco Editor...
    </div>
  ),
});

export default function PlaygroundIDE({ initialExample, allExamples, groupedCategories }) {
  const router = useRouter();

  // State
  const [selectedExample, setSelectedExample] = useState(initialExample);
  const [sourceCode, setSourceCode] = useState(initialExample?.starterSource || '');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('explanation'); // explanation | output | console
  const [mobileTab, setMobileTab] = useState('editor'); // examples | editor | rightPanel
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);

  // Sync if initialExample changes
  useEffect(() => {
    if (initialExample && initialExample.slug !== selectedExample?.slug) {
      setSelectedExample(initialExample);
      setSourceCode(initialExample.starterSource || '');
      setHasUnsavedChanges(false);
      setExecutionResult(null);
    }
  }, [initialExample, selectedExample?.slug]);

  // Handle Example Selection
  const handleSelectExample = (ex) => {
    if (hasUnsavedChanges) {
      const confirmDiscard = window.confirm(
        'You have unsaved changes in the editor. Discard edits and load the new example?'
      );
      if (!confirmDiscard) return;
    }

    setSelectedExample(ex);
    setSourceCode(ex.starterSource || '');
    setHasUnsavedChanges(false);
    setExecutionResult(null);
    setActiveTab('explanation');
    setMobileTab('editor');
    router.push(`/playground/${ex.slug}`, { scroll: false });
  };

  // Handle Code Change
  const handleEditorChange = (value) => {
    setSourceCode(value);
    if (value !== selectedExample?.starterSource) {
      setHasUnsavedChanges(true);
    } else {
      setHasUnsavedChanges(false);
    }
  };

  // Handle Reset
  const handleReset = () => {
    if (hasUnsavedChanges) {
      const confirmReset = window.confirm(
        'Reset source code back to initial example starter template?'
      );
      if (!confirmReset) return;
    }
    setSourceCode(selectedExample?.starterSource || '');
    setHasUnsavedChanges(false);
    setExecutionResult(null);
  };

  // Handle Run
  const handleRun = async () => {
    setIsRunning(true);
    setActiveTab('output');

    try {
      const res = await fetch('/api/playground/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exampleSlug: selectedExample?.slug,
          source: sourceCode,
        }),
      });

      const data = await res.json();
      setExecutionResult(data);
    } catch (err) {
      setExecutionResult({
        status: 'FAILED',
        error: 'Network error contacting playground execution service.',
        logs: ['[Error] Unable to reach backend API.'],
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className={styles.ideContainer} role="region" aria-label="eBPF Code Playground">
      {/* Top Header Bar */}
      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          <div className={styles.title}>
            <span>&gt;_</span>
            <span>{selectedExample?.title || 'eBPF Playground'}</span>
          </div>
          <Badge variant="cyan" size="sm">
            {selectedExample?.language === 'c' ? 'C / eBPF (clang)' : selectedExample?.language}
          </Badge>
          {hasUnsavedChanges && (
            <span className={styles.unsavedBadge}>● Edited</span>
          )}
        </div>

        <div className={styles.topActions}>
          <button
            type="button"
            onClick={handleReset}
            className={`${styles.btnAction} ${styles.btnReset}`}
            title="Reset to starter template"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleRun}
            disabled={isRunning || !sourceCode.trim()}
            className={`${styles.btnAction} ${styles.btnRun}`}
          >
            {isRunning ? 'Validating...' : '▶ Run (Validate)'}
          </button>
        </div>
      </div>

      {/* Mobile Switcher Bar */}
      <div className={styles.mobileNav}>
        <button
          type="button"
          onClick={() => setMobileTab('examples')}
          className={`${styles.tabBtn} ${mobileTab === 'examples' ? styles.tabBtnActive : ''}`}
        >
          📁 Examples
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('editor')}
          className={`${styles.tabBtn} ${mobileTab === 'editor' ? styles.tabBtnActive : ''}`}
        >
          ✏️ Code Editor
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('rightPanel')}
          className={`${styles.tabBtn} ${mobileTab === 'rightPanel' ? styles.tabBtnActive : ''}`}
        >
          📋 Output / Info
        </button>
      </div>

      {/* Main 3-Column Grid */}
      <div className={styles.mainGrid}>
        {/* Left Column: Examples Explorer */}
        <aside
          className={styles.sidebar}
          style={{ display: mobileTab === 'editor' && typeof window !== 'undefined' && window.innerWidth <= 960 ? 'none' : 'flex' }}
          aria-label="Examples Explorer"
        >
          <div className={styles.sidebarHeader}>Playground Examples</div>

          {Object.entries(groupedCategories).map(([category, items]) => (
            <div key={category} className={styles.categoryGroup}>
              <div className={styles.categoryTitle}>{category}</div>
              <ul className={styles.exampleList}>
                {items.map((ex) => {
                  const isSelected = ex.slug === selectedExample?.slug;
                  return (
                    <li
                      key={ex.slug}
                      onClick={() => handleSelectExample(ex)}
                      className={`${styles.exampleItem} ${isSelected ? styles.exampleActive : ''}`}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') handleSelectExample(ex);
                      }}
                    >
                      <span className={styles.exampleName}>{ex.title}</span>
                      <span className={styles.exampleDiff}>{ex.difficulty}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </aside>

        {/* Center Column: Monaco Code Editor */}
        <section
          className={styles.editorSection}
          style={{ display: mobileTab === 'examples' && typeof window !== 'undefined' && window.innerWidth <= 960 ? 'none' : 'flex' }}
          aria-label="Code Editor"
        >
          <div className={styles.editorHeader}>
            <span>{selectedExample?.slug}.bpf.c</span>
            <span>UTF-8 • Tab Size: 4</span>
          </div>

          <div className={styles.editorWrapper}>
            <Editor
              height="100%"
              defaultLanguage="c"
              language={selectedExample?.language || 'c'}
              value={sourceCode}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                automaticLayout: true,
                tabSize: 4,
                wordWrap: 'on',
              }}
            />
          </div>
        </section>

        {/* Right Column: Explanation, Output, and Console */}
        <aside
          className={styles.rightSection}
          style={{ display: mobileTab !== 'rightPanel' && typeof window !== 'undefined' && window.innerWidth <= 960 ? 'none' : 'flex' }}
          aria-label="Program Inspector"
        >
          {/* Tab buttons */}
          <div className={styles.tabsBar}>
            <button
              type="button"
              onClick={() => setActiveTab('explanation')}
              className={`${styles.tabBtn} ${activeTab === 'explanation' ? styles.tabBtnActive : ''}`}
            >
              Explanation
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('output')}
              className={`${styles.tabBtn} ${activeTab === 'output' ? styles.tabBtnActive : ''}`}
            >
              Output
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('console')}
              className={`${styles.tabBtn} ${activeTab === 'console' ? styles.tabBtnActive : ''}`}
            >
              Validation / Log
            </button>
          </div>

          {/* Panel content */}
          <div className={styles.panelBody}>
            {/* Explanation Tab */}
            {activeTab === 'explanation' && (
              <div>
                <h4 style={{ color: '#f0f6fc', margin: '0 0 0.5rem 0', fontSize: '1.05rem' }}>
                  {selectedExample?.title}
                </h4>
                <p style={{ color: '#8b949e', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  {selectedExample?.shortDescription}
                </p>

                <div
                  style={{ color: '#c9d1d9', fontSize: '0.88rem' }}
                  dangerouslySetInnerHTML={{
                    __html: selectedExample?.explanation
                      ? selectedExample.explanation
                          .replace(/### (.*?)\n/g, '<h5 style="color:#58a6ff;margin:1rem 0 0.4rem 0;">$1</h5>')
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/`([^`]+)`/g, '<code style="background:#161b22;padding:0.1rem 0.3rem;border-radius:3px;color:#58a6ff;font-family:monospace;">$1</code>')
                          .replace(/\n\n/g, '<br/><br/>')
                      : '',
                  }}
                />
              </div>
            )}

            {/* Program Output Tab */}
            {activeTab === 'output' && (
              <div>
                <div className={styles.noticeAlert}>
                  <strong>Environment Notice:</strong> {executionResult?.notice || 'Isolated execution sandbox active via Stage 7 Lab Orchestrator (Mock Runner).' }
                </div>

                <div style={{ marginBottom: '0.5rem', fontSize: '0.78rem', color: '#8b949e', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                  Execution Sandbox Output
                </div>

                <pre className={styles.outputTerminal}>
                  {executionResult?.output || executionResult?.mockOutput || selectedExample?.sampleOutput || 'Click "Run" to dispatch code to the isolated lab runner.'}
                </pre>
              </div>
            )}

            {/* Validation / Log Tab */}
            {activeTab === 'console' && (
              <div>
                <div style={{ marginBottom: '0.75rem', fontSize: '0.78rem', color: '#8b949e', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                  System Diagnostics
                </div>

                <ul className={styles.consoleLogs}>
                  <li className={styles.consoleItem}>✓ Monaco Editor initialized</li>
                  <li className={styles.consoleItem}>✓ Target Language: C / eBPF (Clang/LLVM)</li>
                  <li className={styles.consoleItem}>
                    ✓ Static Code Validator: {sourceCode.length} characters (Bounded &lt; 50KB)
                  </li>
                  <li className={styles.consoleItem}>
                    ○ MicroVM Isolation Runner: Pending Stage 7
                  </li>
                  {executionResult?.logs?.map((log, idx) => (
                    <li key={idx} className={styles.consoleItem}>
                      {log}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
