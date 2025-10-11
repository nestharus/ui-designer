# Documentation Index

Welcome to the UI Designer project documentation. This index will help you find the right guide for your needs.

## Getting Started

- **[Development Setup](./development-setup.md)** - First-time setup, installing dependencies, and verifying your environment
- **[Development Workflow](./development-workflow.md)** - Day-to-day development practices and workflows

## Core Guides

### Configuration

- **[TypeScript and Vitest Configuration](./typescript-vitest-config.md)** - Understanding and troubleshooting TypeScript configs, adding new packages
- **[Font Loading Guide](./font-loading-guide.md)** - How to properly load and use fonts

### Development

- **[Code Style Guide](./code-style-guide.md)** - Coding standards and best practices
- **[Linting Guide](./linting-guide.md)** - ESLint configuration and best practices
- **[Testing Guide](./testing-guide.md)** - Writing and running tests with Vitest
- **[API Patterns Guide](./api-patterns-guide.md)** - API design patterns and conventions
- **[State Management Guide](./state-management-guide.md)** - When to use useState, Zustand, TanStack Query, RSC, and Server Actions
- **[Styling Guide](./styling-guide.md)** - When to use Tailwind CSS vs Emotion vs CSS Modules

### Tools and Libraries

- **[Font Awesome Usage](./fontawesome-usage.md)** - Using Font Awesome icons with tree-shaking
- **[Shadcn UI Components](./styling-guide.md)** - Generating UI primitives and styling patterns
- **[Command Reference](./command-reference.md)** - Available CLI commands and scripts
- **[E2E Testing with Playwright](./e2e-testing-guide.md)** - Writing and running end-to-end tests
- **[Version Management with Changesets](./changesets-guide.md)** - Managing package versions and releases

### Workflow

- **[Git Workflow](./git-workflow.md)** - Branching strategy, commits, and pull requests

## Architecture

- **[Architecture Overview](./architecture-overview.md)** - High-level system architecture and patterns
- **[Command Execution Flow](./architecture/command-execution-flow.md)** - How commands flow through the system

## Quick Reference

### Common Issues

| Issue                          | Guide                                                                                              |
| ------------------------------ | -------------------------------------------------------------------------------------------------- |
| `import.meta` TypeScript error | [TypeScript Config Guide](./typescript-vitest-config.md#issue-importmeta-not-recognized)           |
| Test files can't import source | [TypeScript Config Guide](./typescript-vitest-config.md#issue-test-files-cant-import-source-files) |
| Adding a new package           | [TypeScript Config Guide](./typescript-vitest-config.md#adding-a-new-package)                      |
| Font Awesome bundle size       | [Font Awesome Usage](./fontawesome-usage.md)                                                       |
| Test not running               | [Testing Guide](./testing-guide.md#running-tests)                                                  |
| E2E test not running           | [E2E Testing Guide](./e2e-testing-guide.md)                                                        |
| Creating a changeset           | [Changesets Guide](./changesets-guide.md)                                                          |

### Common Commands

```bash
# Install dependencies
bun install

# Run all tests
bun run test

# Type check everything
bun run type-check

# Lint and format
bun run lint
bun run format

# Build all packages
bun run build

# Start development
bun run dev

# Clean shared type outputs
bun run --filter @ui-designer/shared-types clean

# Generate a shadcn/ui component
bunx shadcn@latest add <component>

# Add a dependency (keeps bun.lock consistent)
bun add <package>
```

## Contributing

Before contributing, please read:

1. [Development Setup](./development-setup.md)
2. [Code Style Guide](./code-style-guide.md)
3. [Git Workflow](./git-workflow.md)
4. [Testing Guide](./testing-guide.md)

### Authoring Docs & Plans

- Stable guidance belongs in `docs/` (this directory). Add new guides here and link them from this index.
- Proposals and explorations belong in `plans/`. See `../plans/README.md` for structure (plan folders with `research/` subfolders).
- Release intent goes in `.changeset/`. See [Changesets Guide](./changesets-guide.md).

## Need Help?

1. Check the relevant guide above
2. Search existing issues in the repository
3. Ask in the team chat
4. Create a new issue with details about your problem
