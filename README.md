# UI Designer Monorepo

A Bun‑first monorepo for an agentic design collaboration platform. It contains a Next.js 15 app, shared TypeScript libraries, and supporting services with a consistent TypeScript/Vitest configuration and Turbo‑driven pipelines.

📚 Documentation index: `docs/README.md`

## Quick Start

```bash
# Install dependencies
bun install

# Build shared types (needed by dependents)
bun run setup

# Start development (Turbo via Bun)
bun run dev
```

## Tech Stack

- Runtime & PM: Bun 1.3.x (Bun‑first workflow)
- Language: TypeScript 5.9 (project references; ESNext output; bundler resolution)
- Frontend: Next.js 15 (App Router) + React 19
- Styling: Tailwind CSS 4 (primary), Emotion (dynamic client styling), Shadcn UI components
- Data: TanStack Query 5 for client data caching
- Icons: Font Awesome (tree‑shakeable imports)
- Testing: Vitest (unit/integration), Playwright (E2E)
- Orchestration: Turborepo (invoked via `bun run` scripts)
- Versioning: Changesets

See:

- Architecture: `docs/architecture-overview.md`
- TypeScript + Vitest config: `docs/typescript-vitest-config.md`
- Styling and components: `docs/styling-guide.md`, `docs/fontawesome-usage.md`
- Commands and workflow: `docs/command-reference.md`, `docs/development-workflow.md`

## Testing

This project uses soft assertions (`expect.soft(...)`) to collect multiple failures in a single run. For Playwright E2E tests, always await async matchers (e.g., `await expect.soft(locator).toBeVisible()`). See `docs/testing-guide.md` for detailed guidance on soft assertions and async patterns.

Common commands:

- `bun run test:unit` — run unit tests
- `bun run test:integration` — run integration tests
- `bun run test:e2e` — run Playwright tests
- `bun run codemod:expect-soft` — convert `expect(...)` to `expect.soft(...)` across tests

## Repository Layout

```text
apps/
  web/                   # Next.js 15 App Router application
    app/                 # Route segments and layouts
    app/providers.tsx    # Client providers (TanStack Query, Devtools)
    app/emotion-registry.tsx  # Emotion CacheProvider integration
    features/            # Feature-first UI + logic (co-located tests)
    server/              # Server-only code (actions, data, services)
    lib/                 # Framework-agnostic utilities
    hooks/               # App-wide hooks
    store/               # Zustand global client state
    styles/              # Global Tailwind CSS and theme tokens
    tests/               # Cross-cutting integration tests and fixtures
      integration/       # Integration tests
      e2e/               # Playwright end-to-end tests
  packages/
  shared-types/          # Shared TypeScript contracts (types-only)
  query/                 # Runtime query helpers (query keys, config)
services/                # Backend services (e.g., Vert.x, orchestration)
docs/                    # Long‑form documentation and guides
plans/                   # Plans and per‑plan research (see plans/README.md)
.changeset/              # Changesets for versioning
```

Notes:

- Use `bun run --filter <pkg>` to scope tasks to a workspace; Bun filters the workspace, Turbo runs the task.
- Many directories include local README.md files documenting conventions (example: `apps/web/store/README.md`).

## Contributing

For development workflow, command references, testing, code style, and PR process, see `CONTRIBUTING.md`.

## Community & Support

- Full documentation: `docs/README.md`
- Contributing guide: `CONTRIBUTING.md`
- Git workflow: `docs/git-workflow.md`
