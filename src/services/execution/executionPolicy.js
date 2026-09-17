/**
 * Stage 7: Central Execution Policy & Resource Limits
 *
 * Immutably defines resource constraints, timeouts, rate limits, and network/capabilities
 * policies. Untrusted clients CANNOT override these configurations.
 */

export const ExecutionPolicy = {
  // Source Code Limits
  MAX_SOURCE_BYTES: 50 * 1024, // 50 KB max source size
  ALLOWED_LANGUAGES: ['c', 'ebpf'],

  // Execution Time Limits
  DEFAULT_TIMEOUT_MS: 10 * 1000, // 10 seconds
  MAX_TIMEOUT_MS: 15 * 1000,     // 15 seconds hard ceiling

  // Output & Memory Constraints
  MAX_OUTPUT_BYTES: 64 * 1024,   // 64 KB stdout/stderr buffer max
  MAX_LOG_ENTRIES: 100,          // Up to 100 audit trace entries per execution

  // Resource Sandbox Bounds (for Linux Container / microVM runners)
  MAX_MEMORY_MB: 256,            // 256 MB RAM limit
  MAX_CPU_CORES: 1,              // 1 vCPU
  MAX_PIDS: 64,                  // Max 64 concurrent processes/threads (anti-forkbomb)
  MAX_DISK_MB: 64,               // Max 64 MB ephemeral writable layer

  // Network Policy
  NETWORK_ACCESS: 'none',        // Disallow all external outbound/inbound network traffic

  // Linux Capability Policy
  // Zero elevated capabilities by default. Dropped ALL capabilities.
  // Explicit CAP_BPF / CAP_PERFMON is only applied when running within dedicated microVMs.
  DEFAULT_CAP_DROP: ['ALL'],
  ALLOWED_CAPABILITIES: [],

  // Concurrency & Rate Limiting Policy
  MAX_USER_CONCURRENT_JOBS: 2,   // Max 2 concurrent execution jobs per authenticated user
  MAX_GLOBAL_CONCURRENT_JOBS: 10,// Global queue concurrency threshold
  RATE_LIMIT_WINDOW_MS: 60 * 1000,// 1 minute sliding window
  MAX_JOBS_PER_WINDOW: 12,       // Max 12 job submissions per user per minute

  // Lab Lifecycle Retention
  LAB_TTL_MS: 30 * 1000,         // Ephemeral lab destroyed after 30 seconds max
};

/**
 * Validates untrusted execution input parameters against the ExecutionPolicy.
 */
export function validateExecutionInput({ source, exampleSlug, missionSlug }) {
  if (!source || typeof source !== 'string') {
    return { valid: false, error: 'Source code is required.' };
  }

  const trimmed = source.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Source code cannot be empty.' };
  }

  const byteLength = Buffer.byteLength(source, 'utf8');
  if (byteLength > ExecutionPolicy.MAX_SOURCE_BYTES) {
    return {
      valid: false,
      error: `Source code exceeds maximum limit of ${ExecutionPolicy.MAX_SOURCE_BYTES / 1024}KB (${byteLength} bytes received).`,
    };
  }

  if (!exampleSlug && !missionSlug) {
    return {
      valid: false,
      error: 'Either exampleSlug or missionSlug must be provided for execution context.',
    };
  }

  return { valid: true };
}

/**
 * Sanitizes output strings to adhere to output byte bounds and strip internal secrets.
 */
export function sanitizeOutput(rawOutput) {
  if (!rawOutput) return '';
  let str = String(rawOutput);

  // Enforce maximum output byte length
  if (Buffer.byteLength(str, 'utf8') > ExecutionPolicy.MAX_OUTPUT_BYTES) {
    const truncated = str.slice(0, ExecutionPolicy.MAX_OUTPUT_BYTES);
    return `${truncated}\n\n[BPFQuest Notice: Output truncated because it exceeded maximum limit of ${ExecutionPolicy.MAX_OUTPUT_BYTES / 1024}KB]`;
  }

  // Sanitize any accidental leaks of environment variables / paths
  str = str.replace(/postgres:\/\/[^@\s]+@/g, 'postgres://***:***@');
  str = str.replace(/NEXTAUTH_SECRET=[^\s]+/g, 'NEXTAUTH_SECRET=***');

  return str;
}