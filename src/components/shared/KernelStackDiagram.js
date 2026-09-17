import React from 'react';
import styles from './KernelStackDiagram.module.css';

/**
 * KernelStackDiagram
 * Visualizes the steep multi-layer stack of learning eBPF as specified in Section 6:
 * Linux -> Processes -> Kernel -> Networking -> Tracing -> eBPF -> libbpf -> Real-world systems.
 */
export default function KernelStackDiagram() {
  const layers = [
    { name: 'Linux', desc: 'OS foundations, shells & terminal mechanics' },
    { name: 'Processes', desc: 'Context switching, fork/exec, & memory maps' },
    { name: 'Kernel', desc: 'Ring 0 vs Ring 3 privilege, CPU registers & syscall dispatch' },
    { name: 'Networking', desc: 'OSI stack, socket buffers (sk_buff), & packet flow' },
    { name: 'Tracing', desc: 'Kprobes, uprobes, tracepoints & perf events' },
    { name: 'eBPF', desc: 'Instruction set, bytecode, maps & kernel verifier safety' },
    { name: 'libbpf', desc: 'CO-RE (Compile Once – Run Everywhere), BTF & loader APIs' },
    { name: 'Real-world Systems', desc: 'Observability pipelines, DDoS mitigation & security enforcement' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.stack}>
        {layers.map((layer, idx) => (
          <React.Fragment key={layer.name}>
            <div className={`${styles.layerCard} ${idx >= 5 ? styles.ebpfFocus : ''}`}>
              <div className={styles.layerNumber}>0{idx + 1}</div>
              <div className={styles.layerInfo}>
                <h4 className={styles.layerName}>{layer.name}</h4>
                <p className={styles.layerDesc}>{layer.desc}</p>
              </div>
              <div className={styles.layerStatus}>
                {idx >= 5 ? (
                  <span className={styles.bpfBadge}>eBPF Core</span>
                ) : (
                  <span className={styles.kernelBadge}>Foundation</span>
                )}
              </div>
            </div>
            {idx < layers.length - 1 && (
              <div className={styles.connector} aria-hidden="true">
                <span className={styles.arrow}>↓</span>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
