# ==============================================================================
# BPFQuest Lab Template - Base Minimal Linux Toolchain
# ==============================================================================
# Pin: Debian Bookworm Slim
FROM debian:bookworm-slim

# Prevent interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Install strictly required build utilities & headers
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    clang-16 \
    llvm-16 \
    libbpf-dev \
    linux-libc-dev \
    iproute2 \
    procps \
    ca-certificates \
    && ln -s /usr/bin/clang-16 /usr/bin/clang \
    && ln -s /usr/bin/llvm-strip-16 /usr/bin/llvm-strip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Create unprivileged quest user
RUN groupadd -g 10001 questgroup && \
    useradd -u 10001 -g questgroup -m -s /bin/bash questuser

WORKDIR /home/questuser/workspace
USER questuser

# Explicit default entrypoint
CMD ["/bin/bash"]