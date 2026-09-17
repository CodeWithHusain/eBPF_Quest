/**
 * Lesson Definition: File Descriptors
 * Course: Linux Fundamentals | Module: Files & Filesystems
 */

export const fileDescriptorsLesson = {
  id: 'lesson-file-descriptors',
  courseSlug: 'linux-fundamentals',
  moduleSlug: 'files-and-filesystems',
  title: 'File Descriptors',
  slug: 'file-descriptors',
  description:
    'Understand how the Linux kernel indexes open files, the per-process file descriptor table, file table entries, and descriptor manipulation with dup2 and fcntl.',
  difficulty: 'BEGINNER',
  estimatedMinutes: 20,
  prerequisites: [
    'Files and Metadata',
  ],
  objectives: [
    'Understand how the kernel maps integer file descriptors to open file descriptions.',
    'Inspect open file descriptors of running processes in /proc/[pid]/fd/.',
    'Understand the relationship between file descriptors and eBPF map handles.',
  ],
  content: `
### What is a File Descriptor?

A **File Descriptor (FD)** is a non-negative integer returned by kernel system calls like \`open(2)\`, \`socket(2)\`, \`pipe(2)\`, or \`bpf(2)\`.

To user space, an FD is merely a small integer (e.g. 0, 1, 2, 3). Inside the kernel, it indexes an entry in the process's **File Descriptor Table**:

\`\`\`text
Process (task_struct)
   └── files_struct (fdtable)
         ├── FD 0 ──► [ Open File Description: /dev/pts/0 (read-only, offset 0) ] ──► inode
         ├── FD 1 ──► [ Open File Description: /dev/pts/0 (write-only, offset 0) ] ──► inode
         ├── FD 2 ──► [ Open File Description: /dev/pts/0 (write-only, offset 0) ] ──► inode
         └── FD 3 ──► [ Open File Description: /var/log/syslog (read/write, offset 4096) ] ──► inode
\`\`\`

### File Descriptors and eBPF

In Linux, **eBPF maps and loaded eBPF programs are also exposed to userspace as file descriptors**.

When your userspace loader (e.g. Go Cilium ebpf library, Python BCC, or C libbpf) loads an eBPF program with the \`bpf(BPF_PROG_LOAD, ...)\` system call, the kernel returns an integer file descriptor. As long as that FD remains open in your loader process (or pinned to bpffs under \`/sys/fs/bpf/\`), the eBPF program remains alive in kernel space!
  `,
  terminalCommands: [
    {
      title: 'Inspecting Open File Descriptors of Current Shell',
      command: 'ls -l /proc/$$/fd',
      output: 'total 0\nlrwx------ 1 bpfquest bpfquest 64 Sep 16 12:30 0 -> /dev/pts/2\nlrwx------ 1 bpfquest bpfquest 64 Sep 16 12:30 1 -> /dev/pts/2\nlrwx------ 1 bpfquest bpfquest 64 Sep 16 12:30 2 -> /dev/pts/2\nlr-x------ 1 bpfquest bpfquest 64 Sep 16 12:30 255 -> /bin/bash',
    },
    {
      title: 'Viewing System-Wide File Descriptor Limits',
      command: 'cat /proc/sys/fs/file-max',
      output: '9223372036854775807',
    },
  ],
  codeExamples: [
    {
      language: 'c',
      title: 'Opening a File and Reading Its FD',
      code: `#include <fcntl.h>
#include <stdio.h>
#include <unistd.h>

int main() {
    int fd = open("/etc/hosts", O_RDONLY);
    printf("Acquired kernel file descriptor: %d\\n", fd);
    close(fd);
    return 0;
}`,
    },
  ],
  hints: [
    'The $$ variable in bash expands to the Process ID (PID) of the current shell.',
    'eBPF programs and maps stay loaded in the kernel as long as a user process holds their FD open or they are pinned to bpffs.',
  ],
  knowledgeCheck: {
    title: 'File Descriptor Check',
    type: 'multiple-choice',
    prompt: 'Where in the /proc filesystem can you view symbolic links representing all open file descriptors for process ID 1234?',
    options: ['/proc/1234/fd/', '/proc/1234/files/', '/proc/1234/descriptors/', '/proc/sys/fd/1234/'],
    correctAnswer: '/proc/1234/fd/',
    explanation:
      'The directory /proc/[pid]/fd/ contains symbolic links named by descriptor integer (0, 1, 2, 3...) pointing to the actual files, sockets, or pipes opened by that process.',
  },
  resources: [
    {
      title: 'open(2) — Linux manual page',
      url: 'https://man7.org/linux/man-pages/man2/open.2.html',
    },
    {
      title: 'bpf(2) — Linux manual page',
      url: 'https://man7.org/linux/man-pages/man2/bpf.2.html',
    },
  ],
};

export default fileDescriptorsLesson;
