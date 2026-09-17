import React from 'react';
import styles from './PlaygroundMockup.module.css';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

/**
 * PlaygroundMockup
 * Visual preview of the future eBPF playground specified in Section 11:
 * Split view: code editor on left, program output on right, with clear "Coming soon" notice.
 */
export default function PlaygroundMockup() {
  const codeLines = [
    'SEC("tracepoint/syscalls/sys_enter_execve")',
    'int handle_execve(struct trace_event_raw_sys_enter *ctx) {',
    '    u64 pid_tgid = bpf_get_current_pid_tgid();',
    '    u32 pid = pid_tgid >> 32;',
    '    bpf_printk("EVENT: execve PID: %d\\n", pid);',
    '    return 0;',
    '}',
  ];

  const outputEvents = [
    { pid: '2411', comm: 'nginx', event: 'execve', ts: '0.0014s' },
    { pid: '2918', comm: 'postgres', event: 'openat', ts: '0.0028s' },
    { pid: '3104', comm: 'systemd', event: 'clone', ts: '0.0041s' },
    { pid: '3419', comm: 'curl', event: 'execve', ts: '0.0055s' },
  ];

  return (
    <div className={styles.wrapper}>
      {/* Playground Window Header */}
      <div className={styles.windowHeader}>
        <div className={styles.leftMeta}>
          <div className={styles.windowControls} aria-hidden="true">
            <span className={styles.dotClose} />
            <span className={styles.dotMinimize} />
            <span className={styles.dotMaximize} />
          </div>
          <span className={styles.windowTitle}>eBPF Playground</span>
        </div>

        <div className={styles.rightMeta}>
          <Badge variant="emerald" size="sm">Interactive Environment</Badge>
          <span className={styles.envTag}>Isolated Lab Target</span>
        </div>
      </div>

      {/* Split Panels */}
      <div className={styles.splitGrid}>
        {/* Left: Code Editor Mockup */}
        <div className={styles.editorPanel}>
          <div className={styles.panelBar}>
            <span className={styles.tabActive}>probe_execve.bpf.c</span>
            <span className={styles.langTag}>LLVM Clang / libbpf</span>
          </div>

          <div className={styles.codeView}>
            {codeLines.map((line, idx) => (
              <div key={idx} className={styles.codeLine}>
                <span className={styles.lineNum}>{idx + 1}</span>
                <span className={styles.codeContent}>{line}</span>
              </div>
            ))}
          </div>

          <div className={styles.panelFooter}>
            <Button variant="primary" size="sm" href="/playground">
              Open Full Playground →
            </Button>
            <span className={styles.footerNotice}>Real-time verifier & output logs</span>
          </div>
        </div>

        {/* Right: Program Output Mockup */}
        <div className={styles.outputPanel}>
          <div className={styles.panelBar}>
            <span>Program Output (Ring Buffer Stream)</span>
            <Button variant="ghost" size="sm" disabled style={{ padding: '0 4px', height: '22px' }}>
              Clear
            </Button>
          </div>

          <div className={styles.outputView}>
            <div className={styles.outputTableHeader}>
              <span>PID</span>
              <span>COMM</span>
              <span>EVENT</span>
              <span>TIME</span>
            </div>
            {outputEvents.map((evt, idx) => (
              <div key={idx} className={styles.outputTableRow}>
                <span className={styles.evtPid}>{evt.pid}</span>
                <span className={styles.evtComm}>{evt.comm}</span>
                <span className={styles.evtName}>{evt.event}</span>
                <span className={styles.evtTs}>{evt.ts}</span>
              </div>
            ))}
            <div className={styles.tailStream}>
              <span className={styles.streamDot} />
              <span>Streaming 0.04% CPU overhead</span>
            </div>
          </div>

          <div className={styles.panelFooter}>
            <span className={styles.verifierStatus}>BPF Verifier: 12 instructions verified (safe)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
