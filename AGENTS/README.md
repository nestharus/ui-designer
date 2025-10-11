# Agent Handbook

This is a lean directory for agents. It points you to the canonical documents you should read to understand how to work, test, and deliver changes in this repo.

Use Bun first. Prefer TypeScript. Follow the docs — keep changes scoped and consistent.

## Navigation

- Getting Started
  - Docs index: `../docs/README.md`
  - Dev setup: `../docs/development-setup.md`
  - Workflow and commands: `../docs/development-workflow.md`, `../docs/command-reference.md`

- TypeScript, Testing, and Tooling
  - TS + Vitest architecture and troubleshooting: `../docs/typescript-vitest-config.md`
  - Unit/integration testing: `../docs/testing-guide.md`
  - Linting and style: `../docs/linting-guide.md`, `../docs/code-style-guide.md`
  - E2E testing with Playwright: `../docs/e2e-testing-guide.md`

- Architecture and Patterns
  - Overview: `../docs/architecture-overview.md`
  - Command execution flow: `../docs/architecture/command-execution-flow.md`
  - API patterns: `../docs/api-patterns-guide.md`
  - State management: `../docs/state-management-guide.md`

- UI and Styling
  - Styling standards: `../docs/styling-guide.md`
  - Font Awesome (tree‑shaking): `../docs/fontawesome-usage.md`
  - Font loading: `../docs/font-loading-guide.md`
  - React Signals usage: `../docs/react-signals.md`

- Collaboration
  - Git workflow: `../docs/git-workflow.md`
  - Versioning (Changesets): `../docs/changesets-guide.md`

## Docs & Artifacts Map

- `.changeset/` — Record release intent and changelog entries. Use `bun run changeset`. See `../docs/changesets-guide.md`.
- `plans/` — Planning documents. Create a folder per plan (e.g., `plans/plan 1/`) and place supporting research in `plans/<plan>/research/`. Reference research from the plan.
- `docs/` — All long‑form documentation (guides, references). Update or add here.
- Root entry points — `README.md`, `AGENTS.md`, `AGENTS/README.md` for navigation.
- Specialized folders often have a local `README.md` explaining purpose/structure (e.g., `apps/web/stores/README.md`). Add one when introducing new areas.

## Core Expectations (Brief)

- Runtime and scripts: Bun 1.3.x only. Use `bun run`/`bunx`.
- Testing: Use Vitest (`bun run test`). Do not use `bun test` except for the shim at `test/vitest-shim.test.ts`.
- TypeScript: Follow the multi‑config setup with project references; frontend apps add DOM libs in their own configs.
- Performance: Prefer libraries with built‑in typings; keep icon imports tree‑shakeable.

## Version Guidance

- Version drift policy: When you need versions that don't match this repo's docs or your model knowledge, use context7 to retrieve authoritative information (current versions, release notes, breaking changes, and migration steps) before proposing or applying updates.
- Summarize key changes and risks in your PR/plan and reference the source.
- If an upgrade affects multiple packages, coordinate via Changesets (see `../docs/changesets-guide.md`).

## Tooling

- GPT‑5 Pro (context7): Research and initial planning beyond existing docs.
- Traycer: Plan integration + implementation tracking; keep plan items updated.
- Codex: Implementation in this repo, following Bun‑first workflow.
- Kombai: Frontend debugging and configuration changes (Next.js/Tailwind/Emotion).
- CodeRabbit & Sonar: Reviews; resolve findings or justify with comments.

## Logging Changes

- Prepare a PR “Change Summary” using `git diff --name-only` and `git diff --stat`, plus a concise rationale.
- Propose a final commit message; accept user edits as needed.
- Do not place human‑authored changelogs in `.changeset/` — it stores release intent only.
- If implementing against a plan, add an “Implementation Notes” section to the plan doc summarizing decisions and caveats.

## How to Approach Tasks

- Identify the relevant guide in `../docs/` and follow it end‑to‑end.
- Keep edits focused; don’t change unrelated code or configs.
- Validate with `bun run lint`, `bun run type-check`, and tests.
- If a pattern is missing, extend the docs and reference it here.

When in doubt, start at `../docs/README.md` and drill down.
