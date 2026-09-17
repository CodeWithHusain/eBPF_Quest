/**
 * Lesson Definition: Users and Groups
 * Course: Linux Fundamentals | Module: Permissions
 */

export const usersAndGroupsLesson = {
  id: 'lesson-users-and-groups',
  courseSlug: 'linux-fundamentals',
  moduleSlug: 'permissions',
  title: 'Users and Groups',
  slug: 'users-and-groups',
  description:
    'Examine the Linux Discretionary Access Control (DAC) security model: User IDs (UID), Group IDs (GID), UID 0 (root), /etc/passwd, and credentials in task_struct.',
  difficulty: 'BEGINNER',
  estimatedMinutes: 15,
  prerequisites: [
    'Processes module',
  ],
  objectives: [
    'Understand UIDs, GIDs, and the special omnipotent status of UID 0 (root).',
    'Parse and explain the format of /etc/passwd and /etc/group.',
    'Inspect process credentials (real, effective, and saved UIDs).',
  ],
  content: `
### Discretionary Access Control (DAC)

Linux implements a multi-user security model based on numeric IDs:
- **UID (User ID)**: An integer identifying an account.
  - **UID 0 (\`root\`)**: The kernel's superuser account. By default, processes running with UID 0 bypass DAC permission checks.
  - **System UIDs (1-999)**: Reserved for daemon services (e.g. \`nobody\`, \`systemd-resolve\`, \`postgres\`) following the principle of least privilege.
  - **Regular User UIDs (1000+)**: Assigned to human interactive users.
- **GID (Group ID)**: An integer identifying a security group sharing file or hardware access (e.g. \`sudo\`, \`docker\`, \`dialout\`).

### User Account Database: /etc/passwd

Each line in \`/etc/passwd\` has seven colon-delimited fields:
\`\`\`text
bpfquest:x:1000:1000:BPFQuest Engineer,,,:/home/bpfquest:/bin/bash
   1     2   3    4           5                 6           7
\`\`\`
1. Username
2. Password placeholder (\`x\` indicates password hash is secured in \`/etc/shadow\`)
3. User ID (UID)
4. Primary Group ID (GID)
5. GECOS (User metadata or full name)
6. Home directory path
7. Default login shell

### Process Credentials in task_struct

Inside \`task_struct\`, the kernel tracks credentials using **\`struct cred\`**:
- **Real UID (RUID)**: Who launched the process.
- **Effective UID (EUID)**: Evaluated by the kernel during file open and syscall permission checks.
- **Saved UID (SUID)**: Allows setuid programs (like \`passwd\` or \`sudo\`) to switch between privileged and unprivileged states.
  `,
  terminalCommands: [
    {
      title: 'Displaying Current User and Group IDs',
      command: 'id',
      output: 'uid=1000(bpfquest) gid=1000(bpfquest) groups=1000(bpfquest),4(adm),27(sudo)',
    },
    {
      title: 'Querying Account Entry in /etc/passwd',
      command: 'getent passwd bpfquest',
      output: 'bpfquest:x:1000:1000:BPFQuest Engineer,,,:/home/bpfquest:/bin/bash',
    },
  ],
  codeExamples: [
    {
      language: 'c',
      title: 'eBPF Helper: Querying Process UID/GID',
      code: `// Get UID and GID in an eBPF tracepoint
u64 uid_gid = bpf_get_current_uid_gid();
u32 uid = (u32)uid_gid;
u32 gid = uid_gid >> 32;

if (uid == 0) {
    bpf_printk("Root activity detected!\\n");
}`,
    },
  ],
  hints: [
    'In eBPF, bpf_get_current_uid_gid() returns UID in the lower 32 bits and GID in the upper 32 bits.',
  ],
  knowledgeCheck: {
    title: 'Users & Groups Check',
    type: 'multiple-choice',
    prompt: 'Which UID number represents the root superuser in the Linux kernel security model?',
    options: ['UID 0', 'UID 1', 'UID 1000', 'UID 65534'],
    correctAnswer: 'UID 0',
    explanation:
      'UID 0 represents root. The kernel treats any process with an effective UID of 0 as possessing administrative superuser privileges.',
  },
  resources: [
    {
      title: 'passwd(5) — Linux manual page',
      url: 'https://man7.org/linux/man-pages/man5/passwd.5.html',
    },
    {
      title: 'credentials(7) — Linux manual page',
      url: 'https://man7.org/linux/man-pages/man7/credentials.7.html',
    },
  ],
};

export default usersAndGroupsLesson;
