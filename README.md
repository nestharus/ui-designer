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

## Repository Layout

```text
apps/
  web/                   # Next.js 15 App Router application
    app/                 # Route segments and layouts
    app/providers.tsx    # Client providers (TanStack Query, Devtools)
    app/emotion-registry.tsx  # Emotion CacheProvider integration
    src/                 # App source
packages/
  shared-types/          # Shared TypeScript contracts (builds .d.ts)
services/                # Backend services (e.g., Vert.x, orchestration)
styles/                  # Global Tailwind v4 setup and theme tokens
docs/                    # Long‑form documentation and guides
plans/                   # Plans and per‑plan research (see plans/README.md)
.changeset/              # Changesets for versioning
```

Notes:

- Use `bun run --filter <pkg>` to scope tasks to a workspace; Bun filters the workspace, Turbo runs the task.
- Many directories include local README.md files documenting conventions (example: `apps/web/stores/README.md`).

## Contributing

For development workflow, command references, testing, code style, and PR process, see `CONTRIBUTING.md`.

## Community & Support

- Full documentation: `docs/README.md`
- Contributing guide: `CONTRIBUTING.md`
- Git workflow: `docs/git-workflow.md`
