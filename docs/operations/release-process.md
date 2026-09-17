# Release Process Guide

This document outlines the standard release lifecycle, semantic versioning scheme, pre-flight verification checklist, and release tagging procedures for BPFQuest.

---

## 1. Versioning Scheme

BPFQuest follows [Semantic Versioning (SemVer 2.0.0)](https://semver.org/):

$$\text{MAJOR}.\text{MINOR}.\text{PATCH}$$

- **MAJOR (`x.0.0`)**: Breaking architectural changes, major database schema restructuring, or removal of deprecated curriculum/mission systems.
- **MINOR (`0.x.0`)**: Backwards-compatible new features (e.g., new courses, new missions, playground capabilities, runner integrations).
- **PATCH (`0.0.x`)**: Backwards-compatible bug fixes, typo corrections, security patches, or documentation improvements.

---

## 2. Release Candidate Pre-Flight Checklist

Before cutting any release tag:

1. **Clean Git Working Tree**:
   ```bash
   git status
   # Ensure no uncommitted changes or untracked files
   ```

2. **Run Content Validation**:
   ```bash
   npm run content:validate
   # Verify all lessons, missions, and playground examples satisfy schemas
   ```

3. **Run Code Linting**:
   ```bash
   npm run lint
   # Verify zero ESLint errors or warnings
   ```

4. **Execute Full Test Suite**:
   ```bash
   npm test
   # Ensure all automated test suites pass cleanly
   ```

5. **Verify Production Compilation**:
   ```bash
   npm run build
   # Confirm Next.js production build succeeds with no route generation errors
   ```

6. **Validate Database Migrations**:
   ```bash
   npx prisma validate
   ```

7. **Update Documentation**:
   - Update `CHANGELOG.md` with release highlights, bug fixes, and breaking changes.
   - Update `package.json` version string.
   - Verify `ROADMAP.md` status reflects completed items.

---

## 3. Cutting a Release Tag

1. Commit version bumps and changelog updates:
   ```bash
   git add package.json package-lock.json CHANGELOG.md
   git commit -m "chore(release): bump version to v1.0.0"
   ```

2. Create an annotated Git tag:
   ```bash
   git tag -a v1.0.0 -m "Release v1.0.0: Official Open Source Launch"
   ```

3. Push the commit and tag to GitHub:
   ```bash
   git push origin main --tags
   ```

4. CI/CD pipeline on GitHub Actions will automatically:
   - Validate Prisma schema
   - Run linter and content validator
   - Run automated test suite against PostgreSQL
   - Execute production build
   - Publish the release draft on GitHub Releases

---

## 4. Rollback Plan

If critical regressions are discovered in production:
1. Identify previous stable release tag (e.g., `v0.9.0`).
2. Rollback Docker container deployment to the previous image tag.
3. If database migrations were applied, run Prisma down-migration scripts or restore from point-in-time PostgreSQL backup.
4. Issue a post-mortem issue explaining the root cause and remediation steps.
