/**
 * Lesson Definition: File Permissions
 * Course: Linux Fundamentals | Module: Permissions
 */

export const filePermissionsLesson = {
  id: 'lesson-file-permissions',
  courseSlug: 'linux-fundamentals',
  moduleSlug: 'permissions',
  title: 'File Permissions',
  slug: 'file-permissions',
  description:
    'Decode Linux permission triads (User, Group, Others), read/write/execute bits, and understand why the execute bit on directories controls traversal.',
  difficulty: 'BEGINNER',
  estimatedMinutes: 15,
  prerequisites: [
    'Users and Groups',
  ],
  objectives: [
    'Decode 10-character mode strings in ls -l (-rwxr-xr--).',
    'Understand the three triads: Owner (u), Group (g), and Others (o).',
    'Explain the unique meaning of the execute (x) bit on directories vs files.',
  ],
  content: `
### Decoding the Mode String

When you run \`ls -l\`, the first column displays a 10-character permission string:

\`\`\`text
- r w x r - x r - -
│ └───┘ └───┘ └───┘
│   │     │     └── Others (o): read-only
│   │     └──────── Group (g): read and execute
│   └────────────── User/Owner (u): read, write, and execute
└────────────────── File Type (- = regular file, d = directory, l = symlink, c = char dev)
\`\`\`

### The Three Basic Bits

- **Read (\`r\`)**:
  - On a file: Allows reading the file contents.
  - On a directory: Allows reading the list of filenames in the directory (\`ls\`).
- **Write (\`w\`)**:
  - On a file: Allows modifying or truncating the file contents.
  - On a directory: Allows creating, renaming, or deleting files within that directory!
- **Execute (\`x\`)**:
  - On a file: Allows launching the binary or script.
  - On a directory: **Crucial**: Grants traversal (\`cd\`) into the directory and opening files within it by inode lookup.
  `,
  terminalCommands: [
    {
      title: 'Listing Detailed Permissions of /etc/shadow',
      command: 'ls -l /etc/shadow',
      output: '-rw-r----- 1 root shadow 1240 Sep 16 09:00 /etc/shadow',
    },
    {
      title: 'Testing Directory Execution Without Read Permission',
      command: 'mkdir -p /tmp/traverse_test && chmod 711 /tmp/traverse_test && touch /tmp/traverse_test/secret.txt && cat /tmp/traverse_test/secret.txt',
      output: '',
    },
  ],
  codeExamples: [
    {
      language: 'bash',
      title: 'Inspecting File Mode Bits Numerically with stat',
      code: `# Print octal mode (e.g. 0755, 0644)
stat -c "%a %n" /etc/hosts`,
    },
  ],
  hints: [
    'Without the execute (+x) bit on a directory, you cannot cd into it or access files inside, even if you have read (+r) permission on the files!',
  ],
  knowledgeCheck: {
    title: 'File Permissions Check',
    type: 'multiple-choice',
    prompt: 'What permission bit must be set on a directory to allow a user to navigate into it (`cd`) and access its contents?',
    options: ['Execute (x)', 'Read (r)', 'Write (w)', 'Sticky (t)'],
    correctAnswer: 'Execute (x)',
    explanation:
      'On directories, the execute (x) bit functions as search/traversal permission. Without it, a process cannot enter the directory or resolve pathnames within it.',
  },
  resources: [
    {
      title: 'chmod(1) — Linux manual page',
      url: 'https://man7.org/linux/man-pages/man1/chmod.1.html',
    },
  ],
};

export default filePermissionsLesson;
