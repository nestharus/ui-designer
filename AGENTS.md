# Agents Guide (Lean)

This file is intentionally brief. Use it as a signpost to the canonical documentation and conventions that govern how to work in this repository.

## Start Here

- Read `docs/README.md` for the documentation index and quick commands.
- Then open `AGENTS/README.md` for an agent‑focused navigation of key guides.

## Scope & Precedence

- `AGENTS.md` files apply to the entire directory tree they are in; deeper files override higher ones.
- Prefer following the docs over tribal knowledge. When in doubt, consult the relevant guide below.

## Rules of Engagement (Pointers)

- Use Bun 1.3.0 and run scripts with `bun run`/`bunx`.
- Use Vitest for tests (unit/integration via `bun run test:unit` / `bun run test:integration`), not Bun's test runner (except for the shim in `test/vitest-shim.test.ts`).
- Use `expect.soft(...)` for all assertions in tests (enforced by ESLint). For Playwright E2E tests, always await async matchers: `await expect.soft(locator).toBeVisible()`. For plain value assertions, await the function first: `const value = await fn(); expect.soft(value).toBe(...)`. See `docs/testing-guide.md` for detailed patterns.
- Follow the monorepo TypeScript setup and project references.
- Keep changes scoped and aligned with the existing style and tooling.
- Version drift: if a required library/tool version differs from your knowledge or the repo docs, use context7 to fetch authoritative version details (release notes, breaking changes, migration steps) before proposing or applying changes.
- Always consult the relevant docs before changing code. Start at `docs/README.md`, then open `AGENTS/README.md`, and read any topic-specific guide under `docs/` (e.g., testing, linting, TypeScript, state management) that applies to the task.

After making changes (before requesting review):

- Run `bun run build` and resolve all build errors.
- Run `bun run type-check` and resolve all type errors.
- Run `bun run lint` and resolve lint/style issues.
- Run `bun run test:coverage:all` and ensure thresholds pass. Do not use `bun test`.
- Run `bun run test:e2e` and ensure tests pass.

## Tooling (At a Glance)

- GPT‑5 Pro (context7): Research and initial planning when docs are insufficient or versions diverge.
- Traycer: Keep plans integrated and track implementation status across plan items.
- Codex: Primary implementation assistant (this CLI).
- Kombai: Frontend debugging and project configuration insights.
- CodeRabbit & Sonar: PR reviews and static analysis; address findings or explain exceptions.

Change logging:

- Use `git diff --name-only` / `git diff --stat` to prepare a PR “Change Summary”.
- Do not write changelogs in `.changeset/` — it’s for release intent only.

## Key References

- Docs index: `docs/README.md`
- Agent handbook: `AGENTS/README.md`
- TypeScript + Vitest config: `docs/typescript-vitest-config.md`
- Development workflow and commands: `docs/development-workflow.md`, `docs/command-reference.md`
- Code style and linting: `docs/code-style-guide.md`, `docs/linting-guide.md`
- State management and data fetching: `docs/state-management-guide.md`, `docs/api-patterns-guide.md`
- UI and styling: `docs/styling-guide.md`, `docs/fontawesome-usage.md`, `docs/font-loading-guide.md`, `docs/react-signals.md`
- Architecture overview: `docs/architecture-overview.md`, `docs/architecture/command-execution-flow.md`
- Git workflow and releases: `docs/git-workflow.md`, `docs/changesets-guide.md`

If a task is unclear, find the closest matching guide in `docs/` and follow it. When introducing new packages or patterns, prefer existing conventions and extend the docs rather than diverging.

## Docs & Artifacts Map

- Changesets: `.changeset/` — capture release intent and changelog entries. Use `bun run changeset` and follow `docs/changesets-guide.md`.
- Plans: `plans/` — proposal docs and structured plans. Each plan lives in its own folder (e.g., `plans/plan 1/`). Attach supporting research under `plans/<plan>/research/` and reference it from the plan doc.
- Documentation: `docs/` — all long‑form guides and references. Update existing guides or add new ones here.
- Root guides: `README.md`, `AGENTS.md`, and `AGENTS/README.md` — entry points and navigation.
- Local READMEs: Many directories include a `README.md` explaining local structure and conventions (e.g., `apps/web/store/README.md`). Add one when creating a new specialized folder.

Note: `@ui-designer/shared-types` is types-only. Runtime query helpers (query keys, config) live in `@ui-designer/query`.
