/**
 * Lesson Definition: Files and Metadata
 * Course: Linux Fundamentals | Module: Files & Filesystems
 */

export const filesAndMetadataLesson = {
  id: 'lesson-files-and-metadata',
  courseSlug: 'linux-fundamentals',
  moduleSlug: 'files-and-filesystems',
  title: 'Files and Metadata',
  slug: 'files-and-metadata',
  description:
    'Deep dive into filesystem inodes, file attributes, access/modify/change timestamps (atime, mtime, ctime), and the stat(2) system call.',
  difficulty: 'BEGINNER',
  estimatedMinutes: 18,
  prerequisites: [
    'Paths and Directories',
  ],
  objectives: [
    'Understand what an inode is and what metadata it stores (and what it does NOT store).',
    'Distinguish between atime, mtime, and ctime.',
    'Trace how the stat(2) system call returns file metadata to user space.',
  ],
  content: `
### What is an Inode?

An **inode (index node)** is a kernel data structure on disk that describes a filesystem object (file, directory, socket, named pipe).

Crucially, the inode stores all file metadata **except the filename**:
- File size (in bytes)
- Device ID and inode number
- Ownership (UID and GID)
- Permission bits (read, write, execute)
- Timestamps (\`atime\`, \`mtime\`, \`ctime\`)
- Pointers to disk blocks containing the file contents

The file name is stored **inside directory entries**, pointing to the inode number!

### The Three Timestamps

Every Linux file tracks three distinct timestamps:
1. **atime (Access Time)**: When the file content was last read (often optimized with the \`noatime\` or \`relatime\` mount options to prevent write overhead).
2. **mtime (Modification Time)**: When the **content** of the file was last modified.
3. **ctime (Change Time)**: When the file's **inode metadata** (permissions, owner, link count) was last changed.
  `,
  terminalCommands: [
    {
      title: 'Inspecting File Metadata with stat',
      command: 'stat /etc/hosts',
      output: '  File: /etc/hosts\n  Size: 221        Blocks: 8          IO Block: 4096   regular file\nDevice: 259,2   Inode: 393223      Links: 1\nAccess: (0644/-rw-r--r--)  Uid: (    0/    root)   Gid: (    0/    root)\nAccess: 2026-09-16 10:00:00.000000000 +0000\nModify: 2026-09-16 09:30:00.000000000 +0000\nChange: 2026-09-16 09:30:00.000000000 +0000',
    },
  ],
  codeExamples: [
    {
      language: 'bash',
      title: 'Checking Inode Usage on Mounted Partitions',
      code: `# View filesystem disk space vs inode exhaustion
df -h
df -i`,
    },
  ],
  hints: [
    'A disk can run out of space even with gigabytes free if all available inodes are exhausted by millions of tiny files.',
  ],
  knowledgeCheck: {
    title: 'Inode Metadata Check',
    type: 'multiple-choice',
    prompt: 'Which of the following pieces of information is NOT stored inside a Linux file inode?',
    options: ['The file name', 'The file size', 'The file permissions', 'The modification time (mtime)'],
    correctAnswer: 'The file name',
    explanation:
      'File names are stored in directory entry lists (dentries), which map a text name to an inode number. The inode itself stores sizes, permissions, timestamps, and block pointers, but not the name.',
  },
  resources: [
    {
      title: 'stat(2) — Linux manual page',
      url: 'https://man7.org/linux/man-pages/man2/stat.2.html',
    },
    {
      title: 'inode(7) — Linux manual page',
      url: 'https://man7.org/linux/man-pages/man7/inode.7.html',
    },
  ],
};

export default filesAndMetadataLesson;
