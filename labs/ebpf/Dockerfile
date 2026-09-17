# ==============================================================================
# BPFQuest Lab Template - eBPF & Kernel Tracing Environment
# ==============================================================================
FROM debian:bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive

# Install LLVM/Clang and Linux kernel tracing tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    clang-16 \
    llvm-16 \
    libbpf-dev \
    linux-libc-dev \
    linux-tools-common \
    bpftrace \
    iproute2 \
    procps \
    && ln -s /usr/bin/clang-16 /usr/bin/clang \
    && ln -s /usr/bin/llvm-strip-16 /usr/bin/llvm-strip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Create unprivileged runner user
RUN groupadd -g 10001 questgroup && \
    useradd -u 10001 -g questgroup -m -s /bin/bash questuser

WORKDIR /home/questuser/workspace
USER questuser

CMD ["/bin/bash"]