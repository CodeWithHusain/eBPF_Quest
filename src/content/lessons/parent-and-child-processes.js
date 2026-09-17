/**
 * Lesson Definition: Parent and Child Processes
 * Course: Linux Fundamentals | Module: Processes
 */

export const parentAndChildProcessesLesson = {
  id: 'lesson-parent-and-child-processes',
  courseSlug: 'linux-fundamentals',
  moduleSlug: 'processes',
  title: 'Parent and Child Processes',
  slug: 'parent-and-child-processes',
  description:
    'Master the process creation lifecycle in Linux: fork(2), Copy-on-Write (COW), clone(2), execve(2), and reaping child exit statuses with waitpid(2).',
  difficulty: 'BEGINNER',
  estimatedMinutes: 20,
  prerequisites: [
    'Process IDs',
  ],
  objectives: [
    'Understand the fork() and execve() pattern used across Unix.',
    'Explain how Copy-on-Write (COW) prevents expensive memory copying during process duplication.',
    'Understand zombie processes and how parent processes prevent them using waitpid().',
  ],
  content: `
### The Unix Process Forking Pattern

In Unix, new processes are not created from scratch. Instead, an existing parent process clones itself:

1. **\`fork(2)\`**: Duplicates the calling process.
   - The child receives an exact duplicate of the parent's address space, file descriptor table, and credentials.
   - The parent receives the **child's PID** as the return value.
   - The child receives **0** as the return value!
2. **Copy-on-Write (COW)**:
   - Duplicating a 16 GB process in memory would be prohibitively slow.
   - The kernel makes \`fork()\` virtually instantaneous by marking all physical pages as **read-only** and sharing them between parent and child.
   - Only when parent or child writes to a page does the MMU trigger a page fault, causing the kernel to duplicate that specific 4KB page.
3. **\`execve(2)\`**: Replaces the calling process's memory layout with a brand new program binary from disk.
4. **\`waitpid(2)\`**: The parent process reaps the exit status of the child. If the child finishes executing and the parent fails to call \`wait()\`, the child remains in the process table as a **Zombie process (\`Z\` state)** until reaped.
  `,
  terminalCommands: [
    {
      title: 'Viewing Parent-Child Tree with pstree',
      command: 'pstree -p $$',
      output: 'bash(1204)───pstree(4910)',
    },
    {
      title: 'Tracing fork and clone Syscalls',
      command: 'strace -e trace=clone,clone3,fork /bin/true',
      output: '+++ exited with 0 +++',
    },
  ],
  codeExamples: [
    {
      language: 'c',
      title: 'Classic fork() and exec() Pattern in C',
      code: `#include <stdio.h>
#include <unistd.h>
#include <sys/wait.h>

int main() {
    pid_t pid = fork();
    if (pid == 0) {
        // In Child process
        char *args[] = {"/bin/echo", "Hello from child process!", NULL};
        execve(args[0], args, NULL);
    } else {
        // In Parent process
        int status;
        waitpid(pid, &status, 0);
        printf("Child PID %d exited\\n", pid);
    }
    return 0;
}`,
    },
  ],
  hints: [
    'Copy-on-Write (COW) ensures that fork() only takes microseconds even for massive database processes.',
  ],
  knowledgeCheck: {
    title: 'Process Lifecycle Check',
    type: 'multiple-choice',
    prompt: 'What kernel optimization allows `fork(2)` to duplicate a large process without immediately copying all of its physical RAM?',
    options: ['Copy-on-Write (COW)', 'Direct Memory Access (DMA)', 'Swap Partitioning', 'Kernel Samepage Merging (KSM)'],
    correctAnswer: 'Copy-on-Write (COW)',
    explanation:
      'Copy-on-Write (COW) marks virtual memory pages as shared and read-only. Physical memory pages are only duplicated when either the parent or child executes a write instruction.',
  },
  resources: [
    {
      title: 'fork(2) — Linux manual page',
      url: 'https://man7.org/linux/man-pages/man2/fork.2.html',
    },
    {
      title: 'waitpid(2) — Linux manual page',
      url: 'https://man7.org/linux/man-pages/man2/waitpid.2.html',
    },
  ],
};

export default parentAndChildProcessesLesson;
