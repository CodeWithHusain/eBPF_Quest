# Contributing to BPFQuest

Thank you for your interest in contributing to BPFQuest! We welcome contributions from systems engineers, Linux enthusiasts, kernel hackers, educators, and developers of all backgrounds.

BPFQuest is an open-source, hands-on learning platform for Linux and eBPF. We are committed to real systems rigor, verifiable technical explanations, and secure isolated environments.

---

## Code of Conduct

We are committed to providing a friendly, safe, and welcoming environment for all. Please be respectful, constructive, and collaborative in all interactions across issues, PRs, and discussions.

---

## How to Contribute

### 1. Reporting Issues & Proposing Features
* Search existing issues to verify if the issue has already been logged.
* Use our specialized issue templates:
  - **Bug Report**: Reproducible bugs with OS, Node.js, and browser details.
  - **Feature Request**: Proposals for platform functionality.
  - **Lesson Improvement**: Corrections or expansions to existing curriculum.
  - **Mission Proposal**: Ideas for new hands-on systems challenges.
* For security disclosures, please follow [SECURITY.md](SECURITY.md) and do **not** open public issues.

### 2. Development Workflow
1. Fork the repository on GitHub.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/<your-username>/bpfquest.git
   cd bpfquest
   ```
3. Create a descriptive feature branch:
   ```bash
   git checkout -b feat/describe-your-change
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Run the development server:
   ```bash
   npm run dev
   ```
6. Implement your modifications following our architectural principles.
7. Run the verification suite before opening your PR:
   ```bash
   npm run content:validate   # Ensures curriculum and mission integrity
   npm run lint               # ESLint checks
   npm test                   # Full test suite
   npm run build              # Production build verification
   ```
8. Commit your changes with conventional commit messages:
   ```bash
   git commit -m "feat(missions): add socket buffer inspection challenge"
   ```
9. Push to your fork and submit a Pull Request referencing any related issues.

---

## Content Authoring Guidelines

### Authoring Curriculum Lessons (`src/content/lessons/`)
1. Lessons reside as individual modules in `src/content/lessons/<slug>.js`.
2. Every lesson must export an object adhering to the canonical schema:
   - `id`, `slug`, `courseSlug`, `moduleSlug`, `title`, `description`, `difficulty`, `estimatedMinutes`
   - `prerequisites`: array of prerequisites
   - `objectives`: 3–5 concrete, verifiable technical objectives
   - `content`: Markdown text providing in-depth explanations with real kernel concepts
   - `terminalCommands`: array of `{ title, command, output }` demonstrating CLI inspection
   - `codeExamples`: array of `{ language, title, code }` with accurate C or shell syntax
   - `hints`: practical pointers
   - `knowledgeCheck`: structured quiz with `title`, `type: 'multiple-choice'`, `prompt`, `options`, `correctAnswer`, `explanation`
   - `resources`: authoritative external links (kernel docs, man pages, ebpf.io)
3. Register the lesson in `src/services/contentService.js`.
4. Run `npm run content:validate` to ensure schema adherence.

### Authoring Hands-On Missions (`src/content/missions/`)
1. Missions represent practical, CTF-style debugging or inspection challenges.
2. Create `src/content/missions/<slug>.js` with:
   - `id`, `slug`, `title`, `shortDescription`, `description`, `story`, `category`, `difficulty`, `points`, `isPublished`
   - `objectives`: array of objectives with unique `validationKey`
   - `instructions`: clear investigation steps
   - `successCriteria`: what constitutes a pass
   - `hints`: tiered hints with progressive hints
3. Register the mission in `src/services/missionService.js`.
4. Implement a deterministic evaluation rule in `src/lib/validation/missionValidator.js`.
5. Add test coverage in `tests/missions.test.js`.

### Authoring Playground Examples (`src/content/playground/`)
1. Create `src/content/playground/<slug>.js` with:
   - `id`, `slug`, `title`, `shortDescription`, `category`, `difficulty`, `language`
   - `explanation`: markdown explanation of the probe or section macro
   - `starterSource`: clean, compile-ready C/eBPF code using `vmlinux.h` or libbpf macros
2. Register the example in `src/services/playgroundService.js`.

---

## Coding Standards & Architectural Invariants

* **Language**: Pure modern ECMAScript (JavaScript). Do not introduce TypeScript compiling steps without discussion.
* **Styling**: Vanilla CSS and CSS Modules utilizing tokens from `src/styles/tokens.css`. Do not add Tailwind or CSS-in-JS runtimes.
* **No Fake Metrics or Simulated Execution**: Never hardcode fake user statistics, mock uptime percentages, or simulated server counts. If an environment is sandboxed or mocked, state it explicitly.
* **Security & Isolation**: Arbitrary user code must **never** be executed on the host server. Execution must pass through the isolated lab runner with `--network none` and strict resource boundaries.
* **Accessibility**: Semantic HTML elements, complete keyboard navigation, ARIA live regions for telemetry, and proper contrast ratios.

---

## License

By contributing to BPFQuest, you agree that your contributions will be licensed under the [Apache-2.0 License](LICENSE).
