/**
 * Lesson Definition: Paths and Directories
 * Course: Linux Fundamentals | Module: Files & Filesystems
 */

export const pathsAndDirectoriesLesson = {
  id: 'lesson-paths-and-directories',
  courseSlug: 'linux-fundamentals',
  moduleSlug: 'files-and-filesystems',
  title: 'Paths and Directories',
  slug: 'paths-and-directories',
  description:
    'Master absolute vs relative paths, directory navigation, and the crucial distinction between hard links and symbolic links in the Linux VFS.',
  difficulty: 'BEGINNER',
  estimatedMinutes: 15,
  prerequisites: [
    'Linux Filesystem Hierarchy',
  ],
  objectives: [
    'Differentiate between absolute and relative paths.',
    'Understand directory inodes and the . and .. directory entries.',
    'Distinguish between hard links and symbolic (soft) links at the inode layer.',
  ],
  content: `
### Absolute vs Relative Paths

In the Linux directory tree:
- **Absolute Paths**: Begin with \`/\` (the root directory) and uniquely reference a file regardless of your current location (e.g. \`/var/log/syslog\`).
- **Relative Paths**: Calculated relative to the process's **Current Working Directory (CWD)** (e.g. \`./config.yaml\` or \`../../bin\`).
- **Special Directory Entries**: Every directory contains two implicit directory entries:
  - \`.\`: Points to the directory itself.
  - \`..\`: Points to the parent directory.

### Hard Links vs Symbolic Links (Symlinks)

At the filesystem layer, a directory entry is merely a mapping: \`filename -> inode_number\`.

1. **Hard Links**:
   - Multiple filenames pointing to the exact same inode on the same filesystem.
   - Increment the inode's **link count** (\`nlink\`).
   - If you delete the original filename, the underlying data remains intact until the link count drops to zero!
   - Hard links cannot cross filesystem boundaries or link to directories.
2. **Symbolic Links (Symlinks)**:
   - A special file whose data contains the path string to another target file or directory.
   - Has its own unique inode.
   - Can span different disk partitions and point to non-existent targets (broken symlink).
  `,
  terminalCommands: [
    {
      title: 'Creating and Comparing Inode Numbers for Links',
      command: 'touch /tmp/target.txt && ln /tmp/target.txt /tmp/hard.txt && ln -s /tmp/target.txt /tmp/soft.txt && ls -li /tmp/*txt',
      output: '812499 -rw-rw-r-- 2 bpfquest bpfquest 0 Sep 16 12:00 /tmp/hard.txt\n992014 lrwxrwxrwx 1 bpfquest bpfquest 15 Sep 16 12:00 /tmp/soft.txt -> /tmp/target.txt\n812499 -rw-rw-r-- 2 bpfquest bpfquest 0 Sep 16 12:00 /tmp/target.txt',
    },
  ],
  codeExamples: [
    {
      language: 'bash',
      title: 'Resolving Canonical Realpaths',
      code: `# Print the resolved target of nested symlinks
realpath /usr/bin/python3`,
    },
  ],
  hints: [
    'Notice that /tmp/hard.txt and /tmp/target.txt share the exact same inode number (812499).',
  ],
  knowledgeCheck: {
    title: 'Links and Inodes Check',
    type: 'multiple-choice',
    prompt: 'What happens to a file on disk if you delete the original file but a hard link to it still exists?',
    options: [
      'The data remains completely intact and readable through the hard link',
      'The data is immediately destroyed and the hard link breaks',
      'The filesystem marks the block as corrupted',
      'The hard link converts into a symbolic link',
    ],
    correctAnswer: 'The data remains completely intact and readable through the hard link',
    explanation:
      "A file's disk blocks are only reclaimed by the filesystem when both its inode link count (nlink) drops to 0 and all processes have closed their open file descriptors to it.",
  },
  resources: [
    {
      title: 'ln(1) — Linux manual page',
      url: 'https://man7.org/linux/man-pages/man1/ln.1.html',
    },
    {
      title: 'symlink(7) — Linux manual page',
      url: 'https://man7.org/linux/man-pages/man7/symlink.7.html',
    },
  ],
};

export default pathsAndDirectoriesLesson;
