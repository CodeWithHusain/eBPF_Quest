/**
 * Lesson Definition: Shell Basics
 * Course: Linux Fundamentals | Module: Linux Environment
 */

export const shellBasicsLesson = {
  id: 'lesson-shell-basics',
  courseSlug: 'linux-fundamentals',
  moduleSlug: 'linux-environment',
  title: 'Shell Basics',
  slug: 'shell-basics',
  description:
    'Learn how shells parse input, perform expansions, resolve builtins vs external binaries, execute processes via fork/execve, and pass environment variables.',
  difficulty: 'BEGINNER',
  estimatedMinutes: 18,
  prerequisites: [
    'Terminal Fundamentals',
  ],
  objectives: [
    'Understand the shell execution loop: parse, expand, fork, execve.',
    'Distinguish between shell builtins and external executable binaries.',
    'Manage environment variables and understand inheritance across processes.',
  ],
  content: `
### What is a Shell?

A shell is a command language interpreter running in user space (Ring 3). Common shells include **Bash** (Bourne Again Shell), **Zsh**, and **dash**.

The shell is not part of the kernel; it is simply an ordinary process that reads strings from standard input, evaluates them, and interacts with the kernel on your behalf.

### The Command Execution Lifecycle

When you enter a line like \`ls -la /home\`, the shell executes a precise pipeline:

1. **Tokenization**: Breaks the command line into words and operators.
2. **Expansion**: Resolves tildes (\`~\`), variables (\`$PATH\`), command substitutions (\`$(date)\`), arithmetic (\`$((1+1))\`), and globs (\`*.c\`).
3. **Builtin vs Binary Check**:
   - **Builtin**: Functions built directly into the shell (e.g. \`cd\`, \`export\`, \`echo\`, \`exit\`). These execute inside the shell's own process memory. Builtins do NOT generate an \`execve\` syscall!
   - **External Binary**: The shell searches directories in \`$PATH\` (e.g. \`/usr/bin/ls\`).
4. **Fork & Execve**:
   - The shell calls \`fork()\` (or \`clone()\`) to duplicate itself as a child process.
   - The child process calls \`execve("/usr/bin/ls", ...)\`, which replaces its virtual memory with the target binary.
   - The parent shell waits for the child to exit using \`waitpid()\`.
  `,
  terminalCommands: [
    {
      title: 'Checking Whether a Command is a Builtin or Binary',
      command: 'type cd ls echo ip',
      output: 'cd is a shell builtin\nls is aliased to `ls --color=auto`\necho is a shell builtin\nip is /usr/sbin/ip',
    },
    {
      title: 'Inspecting Environment Variables',
      command: 'printenv SHELL USER PATH | head -n 3',
      output: '/bin/bash\nbpfquest\n/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
    },
  ],
  codeExamples: [
    {
      language: 'bash',
      title: 'Setting and Exporting Environment Variables',
      code: `# Local shell variable (not passed to child processes)
DEBUG_LEVEL=1

# Exported variable (inherited by all forked child processes)
export KERNEL_TARGET="6.8.0"`,
    },
  ],
  hints: [
    "Think about process isolation: can a child process alter its parent's current working directory?",
  ],
  knowledgeCheck: {
    title: 'Command Execution Check',
    type: 'multiple-choice',
    prompt: 'Why must the `cd` (change directory) command be implemented as a shell builtin rather than an external binary?',
    options: [
      'Because an external binary would only change the working directory of its own child process, leaving the shell unchanged',
      'Because changing directories requires Ring 0 kernel execution privilege',
      'Because external binaries cannot read the filesystem',
      'Because system calls cannot be invoked from outside the shell',
    ],
    correctAnswer: 'Because an external binary would only change the working directory of its own child process, leaving the shell unchanged',
    explanation:
      'In Unix, a child process cannot modify the execution environment (including the working directory) of its parent process. If cd were an external binary, it would exit after changing its own directory, leaving the parent shell right where it was.',
  },
  resources: [
    {
      title: 'GNU Bash Manual: Command Execution',
      url: 'https://www.gnu.org/software/bash/manual/',
    },
    {
      title: 'execve(2) — Linux manual page',
      url: 'https://man7.org/linux/man-pages/man2/execve.2.html',
    },
  ],
};

export default shellBasicsLesson;
