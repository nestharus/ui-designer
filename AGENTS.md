# Agents Guide (Lean)

This file is intentionally brief. Use it as a signpost to the canonical documentation and conventions that govern how to work in this repository.

## Start Here

- Read `docs/README.md` for the documentation index and quick commands.
- Then open `AGENTS/README.md` for an agent‑focused navigation of key guides.

## Scope & Precedence

- `AGENTS.md` files apply to the entire directory tree they are in; deeper files override higher ones.
- Prefer following the docs over tribal knowledge. When in doubt, consult the relevant guide below.

## Rules of Engagement (Pointers)

- Use Bun 1.3.x and run scripts with `bun run`/`bunx`.
- Use Vitest for tests (`bun run test`), not Bun's test runner (except for the shim in `test/vitest-shim.test.ts`).
- Follow the monorepo TypeScript setup and project references.
- Keep changes scoped and aligned with the existing style and tooling.
- Version drift: if a required library/tool version differs from your knowledge or the repo docs, use context7 to fetch authoritative version details (release notes, breaking changes, migration steps) before proposing or applying changes.

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
- Local READMEs: Many directories include a `README.md` explaining local structure and conventions (e.g., `apps/web/stores/README.md`). Add one when creating a new specialized folder.
