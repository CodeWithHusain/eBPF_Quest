/**
 * Lesson Definition: chown
 * Course: Linux Fundamentals | Module: Permissions
 */

export const chownLesson = {
  id: 'lesson-chown',
  courseSlug: 'linux-fundamentals',
  moduleSlug: 'permissions',
  title: 'chown',
  slug: 'chown',
  description:
    'Learn how to modify user and group ownership of files, symlinks, and directories using chown and chgrp, and understand why unprivileged users cannot give files away.',
  difficulty: 'BEGINNER',
  estimatedMinutes: 12,
  prerequisites: [
    'chmod',
  ],
  objectives: [
    'Change user and group ownership with chown user:group filename.',
    'Apply recursive ownership changes safely (-R).',
    'Understand why only root (CAP_CHOWN) is permitted to reassign file ownership.',
  ],
  content: `
### Changing Ownership: chown and chgrp

Every file and directory in Linux has an associated Owner UID and Group GID stored in its inode:
- **\`chown\`**: Change Owner (and optionally Group).
- **\`chgrp\`**: Change Group only.

### Syntax and Common Usage

\`\`\`bash
# Change owner only
chown bpfquest report.txt

# Change owner and group simultaneously
chown bpfquest:bpfquest /opt/ebpf/

# Change group only (note the leading colon)
chown :developers shared.c

# Recursive ownership changes on an entire directory tree
chown -R www-data:www-data /var/www/html/
\`\`\`

### Why Users Cannot "Give Away" Files

On modern Linux, regular users **cannot** transfer ownership of their files to another user (e.g. \`chown alice my_file.txt\` run by \`bob\` fails with \`Operation not permitted\`).
- If users could give files away, malicious users could fill up someone else's disk quota or plant unauthorized files in another user's namespace.
- Only processes with **\`CAP_CHOWN\`** privilege (such as root) can reassign file ownership.
  `,
  terminalCommands: [
    {
      title: 'Changing File Ownership to bpfquest',
      command: 'touch /tmp/ownership_test.txt && sudo chown bpfquest:bpfquest /tmp/ownership_test.txt && ls -l /tmp/ownership_test.txt',
      output: '-rw-rw-r-- 1 bpfquest bpfquest 0 Sep 16 13:10 /tmp/ownership_test.txt',
    },
  ],
  codeExamples: [
    {
      language: 'bash',
      title: 'Modifying Symlink Ownership with -h',
      code: `# Change ownership of the symbolic link itself without dereferencing to the target
chown -h bpfquest:bpfquest /tmp/softlink.txt`,
    },
  ],
  hints: [
    'Remember the colon syntax: chown user:group targets both in a single command.',
  ],
  knowledgeCheck: {
    title: 'chown Security Policy Check',
    type: 'multiple-choice',
    prompt: 'Why does the Linux kernel prevent ordinary non-root users from transferring ownership of their own files to another user?',
    options: [
      'To prevent disk quota manipulation and security accountability violations',
      'Because file inodes cannot be rewritten while mounted',
      'Because userspace lacks access to the Virtual File System',
      'Because hard links would be invalidated',
    ],
    correctAnswer: 'To prevent disk quota manipulation and security accountability violations',
    explanation:
      'If users could give files away, a malicious user could consume another user’s disk storage quota or bypass security accountability audits. Hence, chown requires the CAP_CHOWN capability (root).',
  },
  resources: [
    {
      title: 'chown(1) — Linux manual page',
      url: 'https://man7.org/linux/man-pages/man1/chown.1.html',
    },
  ],
};

export default chownLesson;
