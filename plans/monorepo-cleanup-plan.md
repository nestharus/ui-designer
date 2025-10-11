# UI Designer Monorepo Cleanup Plan (Bun 1.3 • Next.js 15 • React 19)

This document captures an actionable, research-informed plan to align the repo to 2025 best practices for a Bun-first TypeScript monorepo using Next.js 15 (App Router), React 19, TanStack Query 5, Tailwind CSS 4, Vitest, ESLint 9 flat config, Turbo, Emotion, and Font Awesome. It highlights current issues, gaps, and concrete next steps so a follow-on agent can flesh out details and execute.

## Goals

- Standardize configuration across packages and apps (TypeScript, ESLint, Vitest, Turbo).
- Stand up a production-ready Next.js 15 App Router app aligned to React 19 patterns.
- Tighten docs and scripts to match enforced workflow (Bun-first, Vitest-only for unit tests).
- Add missing cross-cutting tooling: Zod, Playwright, Changesets, OG image generation (Satori), code highlighting (Shiki), and CI.
- Ensure tree-shakable icon usage and Tailwind v4 alignment across the stack.

## Audit Snapshot (current repo)

- Root config and deps: `package.json:1` shows Bun 1.3.0, workspaces in `apps/*`, `packages/*`, `services/*`.
- Testing: Vitest v3 with coverage and setup file; Turbo orchestrates tasks; Bun test shim exists for validation.
- TS configs: Base config is ESNext/bundler/noEmit; package and vitest configs exist; docs are extensive.
- Linting/formatting: ESLint 9 flat config with TS + React + Next plugin; Prettier + Tailwind plugin; Stylelint for Tailwind v4.
- Tailwind 4: PostCSS via `@tailwindcss/postcss`; global CSS present in `styles/globals.css:1`.
- Shared package: `packages/shared-types` compiles declaration output and has Vitest config with root setup import.
- Apps/Services: Only placeholders exist; no Next.js App Router app yet (`apps/package.json:1`).
- Font Awesome: Free packages installed; also a Font Awesome “kit” package and private registry in `.npmrc`.

References

- Root scripts: `package.json:15` … `package.json:27`
- Vitest config: `vitest.config.ts:1`
- Bun test shim: `test/vitest-shim.test.ts:1`, `bunfig.toml:9`
- TypeScript base: `tsconfig.base.json:1`; root: `tsconfig.json:1`; root vitest: `tsconfig.vitest.json:1`
- ESLint flat config: `eslint.config.js:1`
- Turbo: `turbo.json:1`
- Tailwind/PostCSS: `postcss.config.mjs:1`, `styles/globals.css:1`

## Issues & Gaps

1. No Next.js 15 App Router app

- Apps folder contains only a placeholder (`apps/package.json:1`). There is no `app/` directory, `next.config.ts`, or DOM-enabled TS config.

2. Docs inconsistency around testing commands

- AGENTS.md says “Do NOT use bun test”; README introduces a one-off shim using `bun test` for validating Vitest. Testing guide omits this exception. This is confusing.

3. Font Awesome kit + private registry

- `.npmrc:1` points to `npm.fontawesome.com` with `FONTAWESOME_NPM_AUTH_TOKEN`. Root `package.json` includes `@awesome.me/kit-…` while examples use free icon packages. Using the Kit in a React/Next app is unnecessary and can bloat bundles. Prefer per-icon imports from free/pro packages via npmjs. Only keep private registry if Pro icons are truly needed.

4. Examples vs dependencies mismatch

- `examples/fontawesome-tree-shaking-example.tsx` imports solid/brands icons, but root deps only include `free-regular`. Add missing icon packages if examples are compiled, or clearly mark examples as non-built code.

5. Root dependency placement

- `next`, `react`, and `react-dom` at the root is atypical for a multi-app monorepo. Prefer app-local dependencies to keep root lean and speed installs.

6. Root TypeScript config expectations vs docs

- AGENTS.md mentions “root tsconfig extends vitest config” but root uses `tsconfig.base.json` (which is correct and matches the long-form docs). Align the short guidance with reality to avoid confusion.

7. Vitest config ergonomics

- Root vitest uses `pool: 'forks'` which is more resource-heavy; default threads are faster for most unit tests unless forking is intentional.
- Root `tsconfig.vitest.json:1` excludes packages/apps/services; ensure each package vitest config includes both source and tests (shared-types does this correctly).

8. Tailwind 4 typography

- No explicit typography solution is present. If `@tailwindcss/typography` has a Tailwind v4-compatible release, add it. If not, use a prose layer via CSS utilities or a v4-compatible plugin alternative.

9. State management “signals”

- Clarification: React 19 does not ship a `useSignal` API in core. For local state, stick to React’s APIs (`useState`, `useReducer`, `useOptimistic`), and use TanStack Query for server/cache state. If signals are desired, consider `@preact/signals-react` as an opt-in.
  React DOES ship useSignal in core. There are articles on it.

10. Missing cross-cutting tooling

- Zod for schema validation and runtime type safety.
- Playwright for e2e tests (and smoke/regression for Next pages).
- Changesets for versioning and releases in monorepo.
- OG image generation (Satori + `next/og`).
  Maybe don't need this?
- Code highlighting pipeline (Shiki; optionally `rehype-pretty-code` or `rehype-shiki`).
- CI pipeline (GitHub Actions with Bun, Turbo cache, Vitest coverage, Playwright).
  Not worried about CI yet

11. Emotion SSR with Next

- No app exists yet; when added, Emotion SSR should be wired (CacheProvider + extractCriticalToChunks or the recommended Next v15 approach) to avoid FOUC.

12. ESLint coverage

- Consider adding `eslint-plugin-jsx-a11y` and `eslint-plugin-import` for production apps. Current flat config is solid but can be strengthened for accessibility/import hygiene in Next apps.

## Best Practices (2025 quick reference)

- Bun 1.3
  - Use `bun install --frozen-lockfile` in CI; set `bunfig.toml` cache dir for predictability (`.bun-cache`: `bunfig.toml:5`).
  - Prefer `bun run`/`bunx` for scripts and `bunx turbo` if calling turbo directly.
- TypeScript 5.9
  - Base config: ESNext, `moduleResolution: bundler`, `noEmit: true` at base; per-package build configs emit types only.
  - Keep DOM libs out of base; add to Next app configs only.
- Vitest v3+
  - Default to `pool: 'threads'` unless you need `forks` for process isolation.
  - Use `jsdom` for React component tests; `node` for lib tests.
- Next.js 15 + React 19
  - App Router only (`app/`), PPR where helpful, Server Actions, `useActionState` and `useOptimistic` patterns.
  - Co-locate `route.ts` handlers in `app/api/*` and prefer streaming for large payloads.
  - Enable typed routes and Turbopack; ensure React 19 compat in ESLint and TS config.
- TanStack Query 5
  - Provide `QueryClient` at `app/providers.tsx` with `Hydrate` for SSR/CSR.
  - Use `module augmentation` for `defaultError` (already documented in `packages/shared-types/README.md`).
- Tailwind 4
  - Use `@tailwindcss/postcss` with PostCSS; manage tokens in CSS layers in `styles/globals.css:1`.
  - Evaluate typography plugin compatibility; otherwise create a `prose` utility layer.
- Font Awesome
  - Only import icons you use; avoid kits and `library.add(fas)`. Maintain icon packages per-app.
- Turbo
  - Keep fast feedback: test tasks should not depend on `^build` unless required—use per-package `turbo.json` overrides as documented in AGENTS.md.
- Releases
  - Use Changesets for monorepo releases and semver discipline; integrate with CI to publish packages.

## Proposed Changes (phased)

Phase 0 — Repo hygiene & docs alignment

- Remove Font Awesome Kit and `.npmrc` private registry if Pro icons are not needed; otherwise scope it to the app consuming Pro icons.
- Either add missing FA packages used by examples (solid/brands) or change examples to match installed packages.
- Align documentation:
  - AGENTS.md: clarify the single Bun test shim exception.
  - Testing Guide: explicitly document the shim exception and keep all other tests on Vitest.
  - Fix the root tsconfig note in AGENTS.md to match the actual architecture.
- Consider switching Vitest pool to `threads` for speed in `vitest.config.ts:1` unless fork isolation is required.

Phase 1 — App bootstrap (Next.js 15)

- Create `apps/web` with App Router:
  - `apps/web/app/layout.tsx`, `apps/web/app/page.tsx`, `apps/web/next.config.ts`, `apps/web/tsconfig.json` (DOM libs, Next plugin), `apps/web/postcss.config.mjs` referencing repository PostCSS chain, `apps/web/styles/globals.css` or consume root `styles/`.
  - Move `react`, `react-dom`, `next`, and web-only libraries from root to `apps/web`.
  - Add `@fortawesome/*` packages per-app (tree-shakeable icons actually used by the app).
- Providers: `apps/web/app/providers.tsx` sets up `QueryClientProvider` and `Hydrate` for TanStack Query.
- Emotion SSR: Implement Next + Emotion SSR per official recipe (CacheProvider, extracting critical CSS on SSR).

Phase 2 — Tooling additions

- Zod: Add `zod` and wire basic schema examples (e.g., API payload validation).
- Playwright: Add `@playwright/test`, `playwright.config.ts`, and `e2e/` smoke specs for core routes. Include `bunx playwright install` in dev-setup docs.
- Changesets: Add `.changeset/` configuration, release workflow, and docs on versioning across packages.
- Typography: If `@tailwindcss/typography` v4-compatible is available, add it. Otherwise, add a CSS-based prose layer.
- Shiki: Add `shiki` (or `rehype-pretty-code` w/ Shiki) for syntax highlighted content in docs/blog pages.
- Satori: Add an `app/og/route.tsx` using `next/og` for dynamic Open Graph images.

Phase 3 — CI & repo automation

- GitHub Actions: Add a unified `ci.yml` using `oven-sh/setup-bun`, Turbo cache, `bun run lint`, `bun run type-check`, `bun run test`, and Playwright e2e (matrix with `apps/web`).
- Renovate or Dependabot: Automate dependency updates with monorepo-aware settings.

Phase 4 — Hardening & DX

- ESLint: Add `eslint-plugin-jsx-a11y` and `eslint-plugin-import` in web app.
- Bundle checks: Add `bunx next build --profile` and optional bundle analyzer on-demand.
- Performance: Use `next/image`, React 19 streaming, PPR where appropriate.

## Concrete Tasks & Snippets (for the executor)

- Next app scaffold (proposed paths):
  - `apps/web/next.config.ts` → typed routes + Turbopack enabled.
  - `apps/web/tsconfig.json` → extends root base, `lib: ["ESNext","DOM","DOM.Iterable"]`, `jsx: "preserve"`, `plugins: [{ "name": "next" }]`.
  - `apps/web/app/providers.tsx` → TanStack Query `QueryClientProvider` + `Hydrate`.
  - `apps/web/app/layout.tsx` → includes providers, global CSS, and Emotion CacheProvider.

- Emotion SSR recipe (summary):
  - Create Emotion cache: `createCache({ key: 'css' })`.
  - Wrap app with CacheProvider; extract critical CSS in a custom document or via the Next v15 recommended approach for App Router.

- Playwright bootstrap:
  - `bun add -D @playwright/test` then `bunx playwright install`.
  - Add `e2e/basic.spec.ts` with `test('home loads', ...)` hitting `/` in `apps/web`.

- Zod integration:
  - Add `zod` and demonstrate a simple schema with parse/safeParse; integrate with `react-hook-form` (optional) via `@hookform/resolvers/zod`.

- Satori OG route:
  - `app/og/route.tsx` using `export const runtime = 'edge'` and `ImageResponse`.

- Shiki usage:
  - Add a small server utility to transform Markdown with `remark` + `rehype-shiki` (or direct Shiki) for docs rendering.

## Research Links (for deeper follow-up)

- Bun: https://bun.sh/docs/install, https://bun.sh/docs/runtime/test, https://bun.sh/docs/bundler
- Next.js 15: https://nextjs.org/docs, https://nextjs.org/blog
- React 19: https://react.dev/blog, https://react.dev/reference/react
- TanStack Query 5: https://tanstack.com/query/latest/docs/react/overview
- Tailwind 4: https://tailwindcss.com/docs
- Tailwind Typography: https://github.com/tailwindlabs/tailwindcss-typography (check v4 compatibility)
- Font Awesome React: https://fontawesome.com/docs/web/use-with/react/
- Emotion SSR (Next): https://emotion.sh/docs/ssr
- Vitest: https://vitest.dev/guide
- Turborepo: https://turbo.build/repo/docs
- Playwright: https://playwright.dev/docs/intro
- Changesets: https://github.com/changesets/changesets
- Satori / OG: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image, https://github.com/vercel/satori
- Shiki: https://shiki.style

## Open Questions / Decisions Needed

- Are Pro Font Awesome icons required? If not, remove the private registry and kit.
  Keep Them
- Which app(s) should we scaffold first under `apps/*`? (e.g., `apps/web`, `apps/admin`)
  None yet. Just document how.
- Is e2e testing required in CI on every PR, or only nightly/offline smoke tests?
  Don't worry about that yet.
- Do we enforce Changesets for all package changes, or only published packages?
- Any server-side services (Vert.x, LangGraph) to integrate into this monorepo, or keep separate?
  Vert.x is going to be integrated into the monorepo under services.

## Risks & Mitigations

- Tailwind Typography compatibility with v4 may be fluid → gate behind a fast proof-of-concept; otherwise create a `prose` utility layer.
- Emotion SSR can be finicky with App Router → adopt the official recipe and verify with hydration tests.
- Moving Next/React deps from root to apps may require updating lint/test scripts → lean on Turbo filtering and workspace scripts per app.

## Doc Fixups (summary)

- Update AGENTS.md to:
  - Clarify the one-off Bun test shim exception.
  - Correct the note about root `tsconfig.json` (it should extend base, not vitest).
- Update Testing Guide to include the shim exception in a dedicated “Validation Shim” section.
- Note in README that examples are not built by default (or add missing FA packages if we want them to compile).

---

Status: Draft 1
Owner: Agent (Bun-first)
Next step: Approve Phase 0 hygiene changes and scaffold `apps/web`.
