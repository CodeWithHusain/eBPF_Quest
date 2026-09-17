/**
 * Lesson Definition: sudo
 * Course: Linux Fundamentals | Module: Permissions
 */

export const sudoLesson = {
  id: 'lesson-sudo',
  courseSlug: 'linux-fundamentals',
  moduleSlug: 'permissions',
  title: 'sudo',
  slug: 'sudo',
  description:
    'Explore privilege elevation using sudo, the /etc/sudoers file, least-privilege principles, and fine-grained Linux kernel capabilities (CAP_BPF, CAP_NET_ADMIN).',
  difficulty: 'BEGINNER',
  estimatedMinutes: 18,
  prerequisites: [
    'chown',
  ],
  objectives: [
    'Understand privilege escalation and audit trails with sudo.',
    'Parse and configure rules in /etc/sudoers using visudo.',
    'Discover Linux capabilities (dividing monolithic root into granular privileges like CAP_BPF).',
  ],
  content: `
### Privilege Elevation: sudo

The \`sudo\` (SuperUser DO) utility allows authorized users to execute specific commands as root or another user, while logging all actions to system security logs (\`/var/log/auth.log\`):

- Configured safely via \`visudo\` (which validates syntax before writing to \`/etc/sudoers\` to prevent lockout).
- Eliminates the need to share or expose the root password.

### Beyond Monolithic Root: Linux Capabilities

Historically, Linux operated on a binary security model: either you were an unprivileged process (UID != 0) or you were omnipotent root (UID == 0).

To eliminate this all-or-nothing risk, Linux kernel version 2.2 introduced **Capabilities**—dividing root privileges into distinct units:
- **\`CAP_NET_ADMIN\`**: Configure network interfaces, IP tables, and routing.
- **\`CAP_SYS_ADMIN\`**: Traditional catch-all administrative capability.
- **\`CAP_BPF\`**: Added in Linux 5.8! Allows loading and managing eBPF programs and maps without granting full root privilege to the process.
- **\`CAP_PERFMON\`**: Added in Linux 5.8! Allows attaching eBPF probes for tracing and observability.
  `,
  terminalCommands: [
    {
      title: 'Testing Sudo Access and Capabilities',
      command: 'sudo -l',
      output: 'Matching Defaults entries for bpfquest on ubuntu:\n    env_reset, mail_badpass, secure_path=/usr/local/sbin\\:/usr/local/bin\\:/usr/sbin\\:/usr/bin\\:/sbin\\:/bin\n\nUser bpfquest may run the following commands on ubuntu:\n    (ALL : ALL) ALL',
    },
    {
      title: 'Viewing Process Capabilities with getpcaps',
      command: 'getpcaps $$',
      output: 'Capabilities for `1204\': =',
    },
  ],
  codeExamples: [
    {
      language: 'bash',
      title: 'Granting Specific Capability to a Binary with setcap',
      code: `# Grant eBPF loading capability to a custom tracer binary without sudo
sudo setcap cap_bpf,cap_perfmon+ep /usr/local/bin/my_tracer`,
    },
  ],
  hints: [
    'Always use "sudo visudo" to edit sudoers files—direct editing with nano/vim can break syntax and permanently lock you out of root.',
    'CAP_BPF enables non-root users to safely load eBPF programs.',
  ],
  knowledgeCheck: {
    title: 'Privilege Elevation Check',
    type: 'multiple-choice',
    prompt: 'Which granular Linux capability (introduced in kernel 5.8) allows processes to load and verify eBPF programs without full root permissions?',
    options: ['CAP_BPF', 'CAP_SYS_ADMIN', 'CAP_ROOT_EXEC', 'CAP_TRACE_ALL'],
    correctAnswer: 'CAP_BPF',
    explanation:
      'Introduced in Linux kernel 5.8, CAP_BPF specifically grants permission to invoke bpf(2) commands to load programs and create maps without requiring the all-powerful CAP_SYS_ADMIN.',
  },
  resources: [
    {
      title: 'sudo(8) — Linux manual page',
      url: 'https://man7.org/linux/man-pages/man8/sudo.8.html',
    },
    {
      title: 'capabilities(7) — Linux manual page',
      url: 'https://man7.org/linux/man-pages/man7/capabilities.7.html',
    },
  ],
};

export default sudoLesson;
