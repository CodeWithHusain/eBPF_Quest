/**
 * Lesson Definition: chmod
 * Course: Linux Fundamentals | Module: Permissions
 */

export const chmodLesson = {
  id: 'lesson-chmod',
  courseSlug: 'linux-fundamentals',
  moduleSlug: 'permissions',
  title: 'chmod',
  slug: 'chmod',
  description:
    'Master changing file permissions using both octal bitmask calculations (755, 644, 600) and symbolic operators (u+x, g-w, o=r).',
  difficulty: 'BEGINNER',
  estimatedMinutes: 15,
  prerequisites: [
    'File Permissions',
  ],
  objectives: [
    'Calculate octal permission numbers using binary weights (r=4, w=2, x=1).',
    'Apply symbolic modifications using +, -, and = operators.',
    'Understand umask and how it determines default file permissions.',
  ],
  content: `
### Octal Notation: Binary Weights

Each permission triad (Owner, Group, Others) is represented as a 3-bit binary number where:
- \`r\` (read) = **4** (\`2^2\`)
- \`w\` (write) = **2** (\`2^1\`)
- \`x\` (execute) = **1** (\`2^0\`)

To compute an octal permission:
- \`rwx\` = 4 + 2 + 1 = **7**
- \`rw-\` = 4 + 2 + 0 = **6**
- \`r-x\` = 4 + 0 + 1 = **5**
- \`r--\` = 4 + 0 + 0 = **4**
- \`---\` = 0 + 0 + 0 = **0**

Common standard modes:
- **\`755\`** (\`rwxr-xr-x\`): Standard for executables, scripts, and directories.
- **\`644\`** (\`rw-r--r--\`): Standard for regular data files and web assets.
- **\`600\`** (\`rw-------\`): Confidential files (SSH private keys, secrets).

### Symbolic Notation

Symbolic mode allows targeting specific roles without altering others:
- Roles: \`u\` (user/owner), \`g\` (group), \`o\` (others), \`a\` (all)
- Actions: \`+\` (add bit), \`-\` (remove bit), \`=\` (set exact)
- Example: \`chmod g+w,o-r report.txt\`
  `,
  terminalCommands: [
    {
      title: 'Applying Octal Mode to Secure SSH Key',
      command: 'touch /tmp/id_rsa && chmod 600 /tmp/id_rsa && ls -l /tmp/id_rsa',
      output: '-rw------- 1 bpfquest bpfquest 0 Sep 16 13:00 /tmp/id_rsa',
    },
    {
      title: 'Adding Execution Bit Symbolically',
      command: 'touch /tmp/probe.sh && chmod +x /tmp/probe.sh && ls -l /tmp/probe.sh',
      output: '-rwxrwxr-x 1 bpfquest bpfquest 0 Sep 16 13:00 /tmp/probe.sh',
    },
  ],
  codeExamples: [
    {
      language: 'bash',
      title: 'Recursive Permission Setting with find',
      code: `# Set 755 on directories and 644 on files recursively
find /var/www -type d -exec chmod 755 {} +
find /var/www -type f -exec chmod 644 {} +`,
    },
  ],
  hints: [
    'Always remember the formula: 4 (read) + 2 (write) + 1 (execute).',
  ],
  knowledgeCheck: {
    title: 'chmod Octal Calculation Check',
    type: 'multiple-choice',
    prompt: 'What is the octal permission value for a file where Owner has read+write, Group has read-only, and Others have read-only?',
    options: ['644', '755', '664', '700'],
    correctAnswer: '644',
    explanation:
      'Owner (r+w = 4+2 = 6), Group (r = 4), Others (r = 4). Combined, this yields octal mode 644 (rw-r--r--).',
  },
  resources: [
    {
      title: 'chmod(1) — Linux manual page',
      url: 'https://man7.org/linux/man-pages/man1/chmod.1.html',
    },
  ],
};

export default chmodLesson;
