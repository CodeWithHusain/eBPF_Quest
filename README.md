# BPFQuest

> **Master Linux. Explore eBPF. Build at the Kernel Level.**

BPFQuest is an open-source, hands-on learning platform dedicated to **Linux internals, eBPF (Extended Berkeley Packet Filter), kernel observability, tracing, networking, and systems security**.

Inspired by interactive platforms like TryHackMe, BPFQuest focuses deeply on low-level systems engineering—enabling developers, infrastructure engineers, and security researchers to understand the operating system boundary, write kernel probes, and inspect real system activity safely.

---

## 🌟 Core Features

- **Structured Systems Curriculum (`/learn`)**: Step-by-step technical paths taking you from CPU protection rings and system call dispatching to advanced eBPF maps, socket buffers, and XDP packet filtering. Includes our complete 23-lesson **Linux Fundamentals** course.
- **Hands-On CTF Missions (`/missions`)**: Realistic systems challenges where you investigate processes in `/proc`, track file descriptor leaks, inspect network interfaces, and author verified eBPF probe skeletons.
- **Interactive eBPF Playground (`/playground`)**: Browser-based dual-panel code editor featuring syntax highlighting, curated program examples (Syscall Tracing, Map Counters, XDP Drop), simulated ring buffer telemetry, and verifier instruction proofs.
- **Isolated Lab Infrastructure (`/labs`)**: Security-first execution architecture using container sandboxes with hard resource limits (1 vCPU, 256MB RAM, 64 PIDs, 15s timeout) and strict network isolation (`--network none`).
- **Progress, XP & Streaks (`/dashboard`)**: Deterministic progression tracking, milestone achievement badges (First Syscall, Streak Master, Kernel Pioneer), and daily streak calculations.
- **Global Instant Search (`Ctrl+K`)**: Fast in-memory keyboard-navigable search across all curriculum courses, individual lessons, missions, playground examples, and technical documentation.
- **Technical Documentation Hub (`/docs`)**: Architecture guides explaining Linux kernel internals, protection rings, eBPF verifier safety mechanics, and deployment best practices.
- **Zero Fake Metrics**: Transparent engineering design with real database-backed metrics and live runner status indicators.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router, Pure JavaScript) |
| **Styling** | Vanilla CSS + CSS Modules with Custom Dark Kernel Design Tokens |
| **Database & ORM** | PostgreSQL 15+ with [Prisma ORM](https://www.prisma.io/) |
| **Authentication** | [NextAuth.js v4](https://next-auth.js.org/) (Credentials + GitHub OAuth) + `bcryptjs` |
| **Code Editor** | Monaco Editor (`@monaco-editor/react`) |
| **Testing** | Node.js native test runner (`node --test`) |
| **Sandboxing** | Docker Container Isolation (`--network none`, resource envelopes) |
| **License** | Apache-2.0 |

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (version 18.0 or higher)
- [npm](https://www.npmjs.com/) (version 9 or higher)
- [PostgreSQL](https://www.postgresql.org/) (or use Docker)

### 2. Clone & Install
```bash
git clone https://github.com/bpfquest/bpfquest.git
cd bpfquest
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure your local credentials:
```env
# PostgreSQL connection URL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bpfquest?schema=public"

# NextAuth configuration
NEXTAUTH_SECRET="your-32-byte-secret-generate-with-openssl-rand-hex-32"
NEXTAUTH_URL="http://localhost:3000"

# Lab Execution Mode ('mock' for local preview, 'container' for Docker runner)
LAB_PROVIDER="mock"

# Optional: GitHub OAuth credentials
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
```

### 4. Database Setup & Migrations
```bash
# Generate Prisma Client & push schema
npm run prisma:generate
npx prisma db push

# Optional: Seed initial test data
npm run db:seed
```

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Verification

BPFQuest maintains automated test suites and validation scripts:

```bash
# 1. Validate curriculum, lesson, and mission integrity
npm run content:validate

# 2. Run ESLint code quality checks
npm run lint

# 3. Run automated test suite (57+ unit, security & integration tests)
npm test

# 4. Verify Next.js production compilation
npm run build
```

---

## 📁 Repository Structure

```text
BPF_Quest/
├── prisma/
│   ├── schema.prisma             # PostgreSQL schema (Users, Accounts, Progress, Missions, Badges)
│   └── seed.js                   # Development seed script
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # REST APIs (auth, missions, playground, search, health)
│   │   ├── (auth)/               # Login & signup routes
│   │   ├── dashboard/            # User dashboard with streak & deterministic recommendations
│   │   ├── docs/                 # Technical documentation hub
│   │   ├── labs/                 # Live lab environment status & runner guide
│   │   ├── learn/                # Course catalog & lesson reader
│   │   ├── missions/             # CTF mission catalog & challenge runner
│   │   ├── playground/           # In-browser eBPF code editor & output console
│   │   ├── profile/              # User profile & achievements
│   │   ├── sitemap.js            # Dynamic SEO sitemap generator
│   │   └── robots.js             # Search crawler directives
│   ├── components/               # Atomic UI primitives & composite modules
│   │   ├── layout/               # Navbar (with Ctrl+K search), Footer
│   │   ├── shared/               # Kernel diagrams, terminal animations, mission previews
│   │   └── ui/                   # Button, Card, Badge, Modal, SearchModal
│   ├── content/                  # Pure data definitions for courses, lessons, missions, examples
│   ├── lib/                      # Core backend libraries (auth, db, security, labs, validation)
│   ├── services/                 # Business logic services (content, mission, playground)
│   └── styles/                   # Tokens, variables, and global CSS resets
├── scripts/
│   └── validateContent.js        # Content schema integrity validation script
├── docs/
│   └── operations/               # Production deployment and release guides
├── tests/                        # Node.js automated test suites
├── ARCHITECTURE.md               # Deep system architecture & threat model
├── ROADMAP.md                    # Completed stages & future milestone roadmap
├── CHANGELOG.md                  # Project release history
├── CONTRIBUTING.md               # Curriculum & mission authoring guidelines
├── SECURITY.md                   # Vulnerability disclosure policy
└── LICENSE                       # Apache-2.0 License
```

---

## 🤝 Contributing

We welcome contributions from systems engineers, kernel enthusiasts, educators, and developers!

- **Add a Lesson**: Create a lesson file in `src/content/lessons/` with clear objectives and knowledge checks.
- **Propose a Mission**: Add a practical challenge in `src/content/missions/` with an objective validator rule.
- **Add Playground Examples**: Share useful eBPF probes in `src/content/playground/`.

Read our [Contributing Guidelines](CONTRIBUTING.md) for full instructions and style standards.

---

## 📄 License

BPFQuest is open-source software licensed under the [Apache License 2.0](LICENSE).
