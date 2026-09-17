/**
 * Lesson Definition: Terminal Fundamentals
 * Course: Linux Fundamentals | Module: Linux Environment
 */

export const terminalFundamentalsLesson = {
  id: 'lesson-terminal-fundamentals',
  courseSlug: 'linux-fundamentals',
  moduleSlug: 'linux-environment',
  title: 'Terminal Fundamentals',
  slug: 'terminal-fundamentals',
  description:
    'Understand pseudo-terminals (PTYs), hardware TTYs, terminal emulators, and character devices that bridge user keystrokes to running shells.',
  difficulty: 'BEGINNER',
  estimatedMinutes: 15,
  prerequisites: [
    'What is Linux?',
  ],
  objectives: [
    'Understand the difference between hardware TTYs and pseudo-terminals (PTYs).',
    'Explain how terminal emulators communicate with shells via master/slave pairs.',
    'Inspect terminal devices under /dev/pts/.',
  ],
  content: `
### From Teletypewriters to Pseudo-terminals

In computing history, a terminal was a physical electromechanical typewriter (TeleTYpe, or **TTY**) connected via serial cable to a mainframe computer. In modern Linux:

- **Virtual Consoles (TTYs)**: Physical console screens managed by the kernel (accessed via \`Ctrl+Alt+F1\` through \`F6\`).
- **Pseudo-terminals (PTYs)**: Software emulations of terminal devices. Whenever you open a terminal in GNOME, macOS, VS Code, or establish an SSH session, a **PTY pair** is instantiated.

### PTY Architecture: Master and Slave

A pseudo-terminal is a bidirectional pair of character devices:

- **PTY Master**: Handled by the terminal emulator process (e.g. Alacritty, GNOME Terminal, or sshd).
- **PTY Slave**: Exposes a standard TTY interface under \`/dev/pts/[N]\`. The shell (e.g. \`/bin/bash\`) connects its stdin, stdout, and stderr to this slave.

When you type a key on your keyboard:
1. The terminal emulator captures the raw input event in user space.
2. It writes the bytes to the PTY master file descriptor.
3. The kernel line discipline applies terminal settings (e.g. echoing characters, handling Backspace, converting \`Ctrl+C\` into \`SIGINT\`).
4. The shell reads the processed character stream from the PTY slave device.
  `,
  terminalCommands: [
    {
      title: 'Identifying Your Active PTY Device',
      command: 'tty',
      output: '/dev/pts/2',
    },
    {
      title: 'Listing Active Pseudo-Terminal Nodes',
      command: 'ls -l /dev/pts/',
      output: 'crw--w---- 1 bpfquest tty 136, 0 Sep 16 10:15 0\ncrw--w---- 1 bpfquest tty 136, 1 Sep 16 11:20 1\ncrw--w---- 1 bpfquest tty 136, 2 Sep 16 12:45 2',
    },
  ],
  codeExamples: [
    {
      language: 'bash',
      title: 'Inspecting Terminal Attributes with stty',
      code: `# View terminal baud rate, rows, columns, and line discipline flags
stty -a`,
    },
  ],
  hints: [
    "Check the output of running the 'tty' command in your terminal.",
    'Remember that in Linux, almost all hardware and virtual interfaces are represented as files.',
  ],
  knowledgeCheck: {
    title: 'Terminal Architecture Check',
    type: 'multiple-choice',
    prompt: 'Where does the Linux devpts filesystem mount dynamic pseudo-terminal slave character devices?',
    options: ['/dev/pts/', '/proc/pty/', '/sys/class/tty/', '/tmp/terminal/'],
    correctAnswer: '/dev/pts/',
    explanation:
      'The devpts virtual filesystem mounts at /dev/pts/ and dynamically creates numbered character device nodes (such as /dev/pts/0, /dev/pts/1) for each open terminal session.',
  },
  resources: [
    {
      title: 'The TTY Demystified (Linus Akesson)',
      url: 'https://www.linusakesson.net/programming/tty/',
    },
    {
      title: 'pty(7) — Linux manual page',
      url: 'https://man7.org/linux/man-pages/man7/pty.7.html',
    },
  ],
};

export default terminalFundamentalsLesson;
