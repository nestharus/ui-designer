# Development Workflow

> **⚠️ Important: Command Syntax**
> This project uses **Bun's workspace filtering**, not Turbo's direct CLI.
> ✅ **Correct:** `bun run dev --filter @ui-designer/package-name`
> ❌ **Incorrect:** `turbo run dev --filter=@ui-designer/package-name` (turbo is not in PATH)
> **Why?** The `turbo` CLI is intentionally not in PATH. All commands go through `bun run`, which then invokes Turbo internally. This ensures consistency with our Bun-first workflow and leverages Bun's workspace features.
> See [Command Reference](./command-reference.md) for detailed explanation.

## Daily Development Commands

### Starting Development

```bash
# Start all apps and services in development mode
bun run dev

# Start a specific workspace package
bun run dev --filter @ui-designer/package-name
```

### Building

```bash
# Build all packages and apps
bun run build

# Build a specific package
bun run --filter @ui-designer/package-name build
```

### Adding Dependencies

```bash
# Add a runtime dependency (keeps bun.lock consistent)
bun add <package>

# Add a dev dependency
bun add -d <package>
```

Notes:

- Always use `bun add` (optionally `--dev`) instead of npm/pnpm to maintain a consistent `bun.lock` across the workspace.
- Prefer libraries that ship TypeScript definitions; only add `@types/*` if the package has no bundled types.
- Version drift: If the version you intend to add or upgrade to differs from versions documented here or from your knowledge cutoff, use context7 to validate the current recommended version, read release notes, and check for breaking changes/migration steps before proceeding.

## Tooling Overview

- GPT‑5 Pro (via context7): Research and initial planning when docs don’t cover a case; verify versions and migrations.
- Traycer: Integrate plans and track implementation across plan items.
- Codex: Implementation in the repo (Bun‑first commands, TypeScript patterns, tests).
- Kombai: Frontend debugging and configuration assistance (Next.js, Tailwind, Emotion).
- CodeRabbit & Sonar: Automated reviews (PR comments, static analysis).

Authoring and logging:

- Keep stable guidance in `docs/` and proposals in `plans/` (with `research/` under each plan).
- For each PR, include a “Change Summary” prepared with `git diff --name-only` / `git diff --stat`, and a concise rationale.
- Do not write human‑authored changelogs in `.changeset/`; use it only for release intent entries.

### Testing

```bash
# Run all tests once
bun run test

# Run tests in watch mode
bun run test:watch

# Run tests with coverage
bun run test:coverage

# Run tests for a specific package
bun run --filter @ui-designer/package-name test
```

## Code Quality Checks

Before committing, ensure your code passes all checks:

```bash
# Lint code
bun run lint

# Format code
bun run format

# Check formatting without making changes
bun run format:check

# Type check
bun run type-check
```

### Automated Checks

Git hooks automatically run these checks:

- **Pre-commit**: Linting and formatting on staged files (via lint-staged)
- **Commit-msg**: Validates commit message format (via commitlint)
- **Pre-push**: Runs lint, type-check, and build across all workspaces

#### Understanding Pre-Push Hooks

The pre-push hooks run comprehensive checks before code is pushed to the remote repository:

```yaml
# From lefthook.yml
pre-push:
  commands:
    lint: bun run lint
    type-check: bun run type-check
    build: bun run build
```

**Why no `--filter` or `--affected` flags?**

These commands intentionally run without workspace filters because **Turborepo's caching automatically handles incremental execution**:

1. **Smart Change Detection**: Turbo tracks which files changed since the last successful run
2. **Dependency Awareness**: Uses the dependency graph from `turbo.json` to determine what needs rebuilding
3. **Instant Cache Hits**: If nothing changed, Turbo returns cached results in milliseconds
4. **Consistent Across Environments**: Cache works locally, in CI, and across team members

**Example Scenario:**

```bash
# First push - runs all checks
git push origin main
# ✓ lint: 3 packages checked (12s)
# ✓ type-check: 3 packages checked (8s)
# ✓ build: 3 packages built (15s)

# Second push with no changes
git push origin main
# ✓ lint: 3 packages cached (0.2s)
# ✓ type-check: 3 packages cached (0.1s)
# ✓ build: 3 packages cached (0.3s)

# Third push - only changed shared-types
git push origin main
# ✓ lint: 1 package checked, 2 cached (4s)
# ✓ type-check: 1 package checked, 2 cached (3s)
# ✓ build: 1 package built, 2 cached (5s)
```

**Don't add `--filter` unless you have a specific reason** (like testing a single package). Turbo's automatic caching is more efficient and reliable.

## Making Changes

### 1. Create a Feature Branch

```bash
git checkout -b feat/your-feature-name
```

Branch naming conventions:

- `feat/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions or updates
- `chore/` - Maintenance tasks

### 2. Make Your Changes

- Write clean, maintainable code
- Follow the [Code Style Guide](./code-style-guide.md)
- Add tests for new features
- Update documentation as needed

### 3. Commit Your Changes

```bash
git add .
git commit -m "feat: add new feature"
```

See [Git Workflow](./git-workflow.md) for commit message conventions.

### 4. Push and Create Pull Request

```bash
git push origin feat/your-feature-name
```

Then create a Pull Request on GitHub/GitLab.

## Working with Turbo

### Understanding Turbo Cache

Turbo caches task outputs to speed up subsequent runs:

```bash
# Force run without cache
bun run build --force

# Clear Turbo cache
rm -rf .turbo
```

### Filtering Workspaces

```bash
# Run command in specific workspace
bun run --filter @ui-designer/shared-types build

# Run command in workspace and its dependencies
bun run --filter @ui-designer/app-name... build

# Run command in workspace and its dependents
bun run --filter ...@ui-designer/shared-types build
```

### Verifying Command Syntax

If you're unsure about the correct command syntax, you can verify:

```bash
# ✅ This works - Bun filters workspace, then runs the script
bun run dev --filter @ui-designer/shared-types

# ❌ This fails - turbo is not in PATH
turbo run dev --filter=@ui-designer/shared-types
# Error: turbo: command not found

# ✅ This works but is verbose - bunx runs local turbo
bunx turbo run dev --filter=@ui-designer/shared-types

# To see what actually runs, check package.json scripts:
# "dev": "turbo run dev"  ← This is what bun run dev executes
```

**Key Point:** When you run `bun run dev --filter <package>`, Bun:

1. Filters the workspace to the specified package(s)
2. Executes the `dev` script from package.json: `turbo run dev`
3. Turbo runs the `dev` task only in the filtered workspace

This is why `bun run --filter` works even though we're using Turbo under the hood.

## Debugging

### TypeScript Errors

1. Ensure all dependencies are built: `bun run build`
2. Check for type mismatches in imports
3. Verify `tsconfig.json` settings
4. Use `// @ts-expect-error` with explanation for known issues

### Runtime Errors

1. Check console for error messages
2. Use `console.log()` or debugger statements
3. Verify environment variables are set
4. Check network requests in browser DevTools

### Test Failures

1. Run tests in watch mode: `bun run test:watch`
2. Check test output for specific failures
3. Verify mock data and test setup
4. Use `test.only()` to isolate failing tests

## Hot Reload Issues

If hot reload stops working:

1. Restart the dev server
2. Clear `.next` cache: `rm -rf apps/your-app/.next`
3. Check for syntax errors
4. Verify file watchers aren't exhausted (increase limit on Linux)

## Performance Tips

### Faster Builds

- Use Turbo's cache: Don't use `--force` unless necessary
- Build only what changed: Use `--filter` flag
- Parallelize: Turbo runs tasks in parallel automatically

### Faster Tests

- Use `test.only()` during development
- Run specific test files: `bunx vitest run path/to/test.ts` or `bun run test -- path/to/test.ts`
- Skip slow tests temporarily with `test.skip()`

### Faster Development

- Use `bun run dev` instead of building repeatedly
- Keep dev server running
- Use hot reload instead of full page refreshes

## Common Workflows

### Adding a New Feature

1. Create feature branch
2. Write tests first (TDD approach)
3. Implement feature
4. Update documentation
5. Run all checks
6. Create PR

### Fixing a Bug

1. Create fix branch
2. Write failing test that reproduces bug
3. Fix the bug
4. Verify test passes
5. Run all checks
6. Create PR

### Refactoring Code

1. Create refactor branch
2. Ensure tests pass before refactoring
3. Make incremental changes
4. Run tests after each change
5. Update documentation if needed
6. Create PR

## Resources

- [Command Execution Flow](./architecture/command-execution-flow.md) - Detailed explanation of how `bun run --filter` works
- [Command Reference](./command-reference.md) - Complete command syntax guide
- [Turbo Documentation](https://turbo.build/repo/docs)
- [Bun Documentation](https://bun.sh/docs)
- [Testing Guide](./testing-guide.md)
- [Git Workflow](./git-workflow.md)
