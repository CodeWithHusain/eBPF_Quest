/**
 * Lesson Definition: Signals
 * Course: Linux Fundamentals | Module: Processes
 */

export const signalsLesson = {
  id: 'lesson-signals',
  courseSlug: 'linux-fundamentals',
  moduleSlug: 'processes',
  title: 'Signals',
  slug: 'signals',
  description:
    'Examine asynchronous process notifications in Linux: SIGINT, SIGTERM, uncatchable signals (SIGKILL, SIGSTOP), and signal delivery mechanisms.',
  difficulty: 'BEGINNER',
  estimatedMinutes: 18,
  prerequisites: [
    'Parent and Child Processes',
  ],
  objectives: [
    'Understand Unix signals as asynchronous hardware and software interrupts.',
    'Differentiate between catchable signals (SIGTERM, SIGINT) and uncatchable signals (SIGKILL, SIGSTOP).',
    'Trace signal generation and delivery using kill(1) and kill(2).',
  ],
  content: `
### What is a Signal?

A **signal** is an asynchronous notification sent by the kernel to a process to notify it that an event has occurred. Signals can originate from:
- Hardware exceptions (e.g. \`SIGSEGV\` on invalid memory dereference, \`SIGFPE\` on division by zero).
- Terminal keyboard shortcuts (e.g. \`Ctrl+C\` sends \`SIGINT\`, \`Ctrl+Z\` sends \`SIGTSTP\`).
- Other processes via the \`kill(2)\` system call.

### Common Standard Signals

| Signal | Number | Default Action | Catchable? | Description |
| :--- | :--- | :--- | :--- | :--- |
| \`SIGHUP\` | 1 | Terminate | Yes | Hangup detected on controlling terminal or reload config |
| \`SIGINT\` | 2 | Terminate | Yes | Terminal interrupt (\`Ctrl+C\`) |
| \`SIGQUIT\` | 3 | Core dump | Yes | Terminal quit (\`Ctrl+\\\`) |
| \`SIGKILL\` | 9 | Terminate | **NO** | Uncatchable, immediate termination by kernel |
| \`SIGTERM\` | 15 | Terminate | Yes | Polite termination request (default for \`kill\`) |
| \`SIGSTOP\` | 19 | Stop | **NO** | Uncatchable, pause process execution |
| \`SIGCHLD\` | 17 | Ignore | Yes | Child process stopped or terminated |

### Why SIGKILL and SIGSTOP Cannot Be Caught

The kernel explicitly blocks processes from registering custom signal handlers for \`SIGKILL\` (9) and \`SIGSTOP\` (19). This guarantees that system administrators can always forcefully terminate rogue or hung processes.
  `,
  terminalCommands: [
    {
      title: 'Listing All Supported Kernel Signals',
      command: 'kill -l | tr " " "\\n" | head -n 10',
      output: 'HUP\nINT\nQUIT\nILL\nTRAP\nABRT\nBUS\nFPE\nKILL\nUSR1',
    },
    {
      title: 'Sending Polite SIGTERM to a Background Job',
      command: 'sleep 60 & kill -15 $!',
      output: '[1]+  Terminated              sleep 60',
    },
  ],
  codeExamples: [
    {
      language: 'c',
      title: 'Registering a SIGINT Handler in C',
      code: `#include <stdio.h>
#include <signal.h>
#include <unistd.h>

void handle_sigint(int sig) {
    printf("\\nCaught SIGINT (%d)! Cleaning up resources before exit...\\n", sig);
    _exit(0);
}

int main() {
    signal(SIGINT, handle_sigint);
    printf("Running... Press Ctrl+C to test signal handler.\\n");
    while (1) pause();
    return 0;
}`,
    },
  ],
  hints: [
    'Remember: SIGTERM gives a process a chance to flush buffers and close connections; SIGKILL immediately yanks execution away.',
  ],
  knowledgeCheck: {
    title: 'Signals Check',
    type: 'multiple-choice',
    prompt: 'Which two Linux signals CANNOT be caught, blocked, or ignored by a user process?',
    options: ['SIGKILL and SIGSTOP', 'SIGTERM and SIGINT', 'SIGHUP and SIGQUIT', 'SIGSEGV and SIGBUS'],
    correctAnswer: 'SIGKILL and SIGSTOP',
    explanation:
      'The Linux kernel architecture prohibits user programs from catching, blocking, or ignoring SIGKILL (signal 9) and SIGSTOP (signal 19), guaranteeing root authority over process termination.',
  },
  resources: [
    {
      title: 'signal(7) — Linux manual page',
      url: 'https://man7.org/linux/man-pages/man7/signal.7.html',
    },
    {
      title: 'kill(2) — Linux manual page',
      url: 'https://man7.org/linux/man-pages/man2/kill.2.html',
    },
  ],
};

export default signalsLesson;
