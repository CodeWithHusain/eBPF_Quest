/**
 * Lesson Definition: Working with Commands
 * Course: Linux Fundamentals | Module: Linux Environment
 */

export const workingWithCommandsLesson = {
  id: 'lesson-working-with-commands',
  courseSlug: 'linux-fundamentals',
  moduleSlug: 'linux-environment',
  title: 'Working with Commands',
  slug: 'working-with-commands',
  description:
    'Master standard streams (stdin, stdout, stderr), stream redirection operators, and how anonymous pipes stream data between processes directly through kernel memory buffers.',
  difficulty: 'BEGINNER',
  estimatedMinutes: 20,
  prerequisites: [
    'Shell Basics',
  ],
  objectives: [
    'Master the three standard streams: stdin (FD 0), stdout (FD 1), and stderr (FD 2).',
    'Understand how pipes (|) create kernel anonymous pipe buffers between processes.',
    'Redirect streams using >, >>, 2>&1, and <.',
  ],
  content: `
### Standard Streams and File Descriptors

In Linux, every newly created process inherits three standard file descriptors (FDs):

- **FD 0 (stdin)**: Standard Input (default: keyboard / PTY).
- **FD 1 (stdout)**: Standard Output (default: terminal display).
- **FD 2 (stderr)**: Standard Error (unbuffered channel for error messages).

### The Kernel Pipe Architecture (\`|\`)

When you construct a pipeline like:
\`\`\`bash
ps aux | grep nginx | wc -l
\`\`\`
The shell:
1. Calls the \`pipe(2)\` system call, which allocates an in-kernel circular ring buffer with a read descriptor and a write descriptor.
2. Spawns each command concurrently via \`fork()\`.
3. Calls \`dup2(2)\` to redirect \`stdout\` (FD 1) of the producer process to the write end of the pipe, and \`stdin\` (FD 0) of the consumer process to the read end.
4. Data flows directly through memory without touching physical disk.
  `,
  terminalCommands: [
    {
      title: 'Redirecting stdout and stderr into Separate Files',
      command: 'ls /etc/hosts /nonexistent 1> /tmp/out.log 2> /tmp/err.log && cat /tmp/err.log',
      output: "ls: cannot access '/nonexistent': No such file or directory",
    },
    {
      title: 'Combining stdout and stderr into One Stream',
      command: 'make -v > /tmp/build.log 2>&1 && head -n 1 /tmp/build.log',
      output: 'GNU Make 4.3',
    },
  ],
  codeExamples: [
    {
      language: 'bash',
      title: 'Creating and Reading from a FIFO (Named Pipe)',
      code: `# Create a named pipe on the filesystem
mkfifo /tmp/bpf_event_pipe

# In terminal 1 (blocks waiting for writer):
cat < /tmp/bpf_event_pipe

# In terminal 2:
echo "Kernel trace packet detected" > /tmp/bpf_event_pipe`,
    },
  ],
  hints: [
    'Pipes allocate the buffer, but another syscall duplicates descriptor indices.',
  ],
  knowledgeCheck: {
    title: 'Streams and Pipes Check',
    type: 'multiple-choice',
    prompt: 'Which system call does the shell invoke to duplicate and redirect a file descriptor (such as wiring a pipe into stdout)?',
    options: ['dup2()', 'mmap()', 'pipe()', 'ioctl()'],
    correctAnswer: 'dup2()',
    explanation:
      'The dup2(oldfd, newfd) system call atomically closes newfd if necessary and duplicates oldfd onto newfd, enabling stream redirection in child processes before execve.',
  },
  resources: [
    {
      title: 'pipe(7) — Linux manual page',
      url: 'https://man7.org/linux/man-pages/man7/pipe.7.html',
    },
    {
      title: 'dup(2) — Linux manual page',
      url: 'https://man7.org/linux/man-pages/man2/dup.2.html',
    },
  ],
};

export default workingWithCommandsLesson;
