# Contributing to UI Designer

Thank you for your interest in contributing to the UI Designer project! This guide provides a quick overview to get you started.

## Quick Start

### Prerequisites

- Bun 1.3.x
- Git
- A code editor

### Setup

```bash
# Clone and install
git clone <repository-url>
cd ui-designer
bun install

# Build shared types and install hooks
bun run setup
bun run prepare

# Verify setup
bun run type-check && bun run lint && bun run test
```

See the [Development Setup Guide](./docs/development-setup.md) for detailed instructions.

## Tooling & Roles

This project uses a set of complementary tools across the lifecycle. Use the right tool for the job:

- GPT‑5 Pro (via context7): Research and initial planning. Use context7 to fetch authoritative sources (release notes, breaking changes, migration guides) when versions differ from docs or prior knowledge.
- Traycer: Plan integration and implementation tracking. Keep plan status in sync and link code changes to plan items.
- Codex (this CLI): General implementation work across the repo. Follow the Bun‑first workflow and our docs.
- Kombai: Frontend debugging and project configuration changes (e.g., Next.js/Tailwind/Emotion setup insights).
- CodeRabbit & Sonar: Automated reviews. Address findings, or justify deviations with comments and fixes in follow‑ups.

Document references:

- Agent pointers: `AGENTS.md`, `AGENTS/README.md`
- Plans and research: `plans/` and `plans/<plan>/research/` (see `plans/README.md`)

## Development Workflow

```bash
# Start development
bun run dev

# Run tests
bun run test

# Check code quality
bun run lint
bun run format
bun run type-check
```

See the [Development Workflow Guide](./docs/development-workflow.md) for more details.

### Workspace Filtering

Use Bun's workspace filtering to target specific packages:

```bash
# Run a script for a specific workspace
bun run dev --filter @ui-designer/package-name

# Build a package and its dependencies
bun run build --filter @ui-designer/package-name...

# Build a package and its dependents
bun run build --filter ...@ui-designer/package-name
```

Behind the scenes, `bun run` invokes Turbo in the filtered workspace. Prefer `bun run`/`bunx` over calling `turbo` directly.

### Scripts

```bash
# Top-level scripts (Turbo pipeline)
bun run dev           # Start all dev targets
bun run build         # Build all packages/apps
bun run lint          # ESLint across workspaces
bun run format        # Prettier write
bun run type-check    # TypeScript project references
bun run clean         # Clean caches; runs per-package clean

# Tests (Vitest)
bun run test
bun run test:watch
bun run test:coverage

# E2E (Playwright)
bun run playwright:install
bun run test:e2e
bun run test:e2e:ui
```

Important:

- Always use Vitest for tests. Do not use `bun test` except the validation shim `test/vitest-shim.test.ts`.
- Prefer `bun run`/`bunx` to ensure the Bun-first workflow and correct Turbo invocation.

### Adding Dependencies

```bash
# Add a runtime dependency (keeps bun.lock consistent)
bun add <package>

# Add a dev dependency
bun add -d <package>
```

Notes:

- Prefer libraries that ship TypeScript definitions; only add `@types/*` if the package has no bundled types.
- Version drift: If the version you intend to add/upgrade differs from docs or your knowledge, use context7 to retrieve authoritative version info (release notes, breaking changes, migration steps) before proceeding.

### UI & Styling

- Tailwind v4 is the default for static styles and Server Components.
- Emotion is for dynamic, client-only styling; see `apps/web/app/emotion-registry.tsx`.
- Generate Shadcn UI primitives:

```bash
bunx shadcn@latest add <component>
```

See [Styling Guide](./docs/styling-guide.md) and [Font Awesome Usage](./docs/fontawesome-usage.md).

### State & Data

- TanStack Query 5 provides client caching; provider is initialized in `apps/web/app/providers.tsx`.
- Use Zustand for ephemeral UI state only (see `apps/web/stores/README.md`).

### Versioning (Changesets)

```bash
bun run changeset         # Create a changeset for your changes
bun run version-packages  # Bump versions based on changesets
# Optional: publish
bun run release
```

See [Changesets Guide](./docs/changesets-guide.md). When upgrading dependencies across packages, include rationale and risk in the changeset. If versions differ from docs/knowledge, validate with context7 first.

## Change Logging & Commit Messages

- Do not write human‑authored changelogs in `.changeset/`. That folder is for release intent entries only (see guide below).
- For each PR, include a “Change Summary” in the PR description:
  - What changed and why (bulleted, concise)
  - Affected files/areas (use `git diff --name-only` and `git diff --stat` to prepare)
  - Any migrations or follow‑ups
- Propose a final commit message using our conventional format (see `docs/git-workflow.md`). The user may request edits; be ready to update it.
- When working under a plan, add an “Implementation Notes” section to the plan doc (in `plans/<plan>/`) summarizing decisions and caveats.

## Making Changes

1. **Create a branch**: `git checkout -b feat/your-feature-name`
2. **Make changes**: Write code, add tests, update docs
3. **Commit**: `git commit -m "feat: add new feature"`
4. **Push**: `git push origin feat/your-feature-name`
5. **Create PR**: Submit pull request for review

See the [Git Workflow Guide](./docs/git-workflow.md) for commit conventions and best practices.

## Code Quality

- **TypeScript**: All code must be in TypeScript
- **Testing**: Write tests for new features
- **Style**: Follow ESLint and Prettier configurations
- **Documentation**: Update docs for API changes

See the [Code Style Guide](./docs/code-style-guide.md) and [Testing Guide](./docs/testing-guide.md) for detailed guidelines.

## Pull Request Process

1. Ensure all checks pass (lint, type-check, tests)
2. Update documentation if needed
3. Add tests for new features
4. Request review from maintainers
5. Address review feedback

## Project Structure

```text
ui-designer/
├── apps/           # Frontend applications (Next.js)
├── packages/       # Shared libraries
├── services/       # Backend services
├── styles/         # Global styles and design tokens
├── docs/           # Documentation
└── plans/          # Planning documents (per-plan folders with research/)
```

Documentation updates and artifact placement:

- Stable guidance belongs in `docs/` (see `docs/README.md` → Authoring Docs & Plans)
- Plans and research belong in `plans/` (per-plan folders with `research/`)
- Release intent goes in `.changeset/` (see `docs/changesets-guide.md`)
- Agent-specific pointers: `AGENTS.md`, `AGENTS/README.md`

## Adding New Packages

When adding a new package to the monorepo, follow the complete setup guide to avoid configuration issues:

📚 **[TypeScript and Vitest Configuration Guide](./docs/typescript-vitest-config.md#adding-a-new-package)**

Quick checklist:

1. Create package directory structure
2. Add `package.json` with proper scripts
3. Create `tsconfig.json` for building (extends base, excludes tests)
4. Create `tsconfig.vitest.json` for testing (includes source and tests)
5. Create `vitest.config.ts` if package has tests
6. Update root `tsconfig.json` references if needed

**Important:** Each package needs TWO TypeScript configs:

- `tsconfig.json` - For building the package (excludes test files)
- `tsconfig.vitest.json` - For testing (includes source and test files)

See the [detailed guide](./docs/typescript-vitest-config.md) for templates and troubleshooting.

## Documentation

📚 **[Complete Documentation Index](./docs/README.md)** - All guides organized by topic

### Essential Guides

- [Development Setup](./docs/development-setup.md) - Initial setup and prerequisites
- [TypeScript and Vitest Configuration](./docs/typescript-vitest-config.md) - Config architecture and troubleshooting
- [Testing Guide](./docs/testing-guide.md) - Writing and running tests
- [Code Style Guide](./docs/code-style-guide.md) - Coding standards
- [Git Workflow](./docs/git-workflow.md) - Branching and commit conventions

### Additional Resources

- [Development Workflow](./docs/development-workflow.md) - Daily development tasks
- [Font Awesome Usage](./docs/fontawesome-usage.md) - Icon usage guidelines
- [Font Loading Guide](./docs/font-loading-guide.md) - Font optimization
- [API Patterns Guide](./docs/api-patterns-guide.md) - API design patterns
- [Command Reference](./docs/command-reference.md) - Available CLI commands

## Common Issues

### TypeScript Errors

**`import.meta` not recognized:**

```text
TS1343: The 'import.meta' meta-property is only allowed when...
```

→ See [TypeScript Config Guide - import.meta issue](./docs/typescript-vitest-config.md#issue-importmeta-not-recognized)

**Test files can't import source:**

```text
TS6307: File 'X' is not listed within the file list of project
```

→ See [TypeScript Config Guide - import issues](./docs/typescript-vitest-config.md#issue-test-files-cant-import-source-files)

### Dependency Issues

**Missing modules or "turbo not found" warnings:**

If you see errors like:

- `Cannot find package 'package-json-from-dist'`
- `Cannot find module '@eslint-community/eslint-utils'`
- `No locally installed 'turbo' found`

**Solution:** Clean install dependencies:

```bash
# Windows PowerShell
Remove-Item -Recurse -Force node_modules,.bun-cache
bun install

# Unix-like systems
rm -rf node_modules .bun-cache
bun install
```

→ See [Development Setup - Troubleshooting](./docs/development-setup.md#troubleshooting) for more details.

**For other issues:** Check the [Documentation Index](./docs/README.md) or create an issue.

## Getting Help

- Check existing issues and discussions
- Create a new issue with the `question` label
- Reach out to the maintainers

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
