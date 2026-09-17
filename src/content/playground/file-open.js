/**
 * Playground Example: Observe File Opens
 * Category: Tracing | Language: c
 */

export const fileOpenExample = {
  id: 'example-file-open',
  slug: 'file-open',
  title: 'Observe File Opens',
  shortDescription: 'Trace openat system calls to detect unauthorized disk file access.',
  category: 'Tracing',
  difficulty: 'BEGINNER',
  language: 'c',
  order: 3,
  prerequisites: ['Linux Fundamentals: File Descriptors', 'Lesson: Files & Metadata'],
  explanation: `
### How It Works

This program monitors file access across the operating system:

1. **\`SEC("tracepoint/syscalls/sys_enter_openat")\`**: Hooks into the modern POSIX \`openat(2)\` system call entry point.
2. **\`bpf_probe_read_user_str()\`**: Essential kernel helper to safely read memory from user-space pointers. Directly dereferencing user pointers inside the kernel causes a page fault or crash; the helper safely copies the filename string.
3. **Audit Trails**: Allows security tooling to observe every file path opened by web servers, databases, or attackers.
  `,
  starterSource: `// BPFQuest — Observe File Opens
// Hooks sys_enter_openat and safely reads user-space file paths

#include "vmlinux.h"
#include <bpf/bpf_helpers.h>

SEC("tracepoint/syscalls/sys_enter_openat")
int handle_openat(struct trace_event_raw_sys_enter *ctx)
{
    u32 pid = bpf_get_current_pid_tgid() >> 32;

    // Arg 1 is dirfd, Arg 2 is the filename pointer in user memory
    const char *filename_ptr = (const char *)ctx->args[1];

    char filename[64];
    // Safely copy user string into kernel memory buffer
    long res = bpf_probe_read_user_str(&filename, sizeof(filename), filename_ptr);

    if (res > 0) {
        bpf_printk("PID %d OPENED FILE: %s\\n", pid, filename);
    }

    return 0;
}

char LICENSE[] SEC("license") = "Dual BSD/GPL";
`,
  sampleOutput: `STATUS: SIMULATED ENVIRONMENT (Stage 7 MicroVM Lab Runner Coming Soon)

$ bpfquest compile file_open.bpf.c
$ bpfquest attach syscalls:sys_enter_openat

[Example Output - Not live kernel execution]
PID     COMM            FILENAME
842     sshd            /etc/passwd
842     sshd            /etc/shadow
4210    postgres        /var/lib/postgresql/data/global/1260
1822    nginx           /var/www/html/index.html
`,
};
