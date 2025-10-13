# Integration Tests

Integration tests validate cross-cutting scenarios that span multiple features, modules, or layers.

## Structure

- `client/` — UI + providers + routing + React Query. Validates page shells, provider wiring, navigation behaviors, and React Query contracts (keys, invalidation, hydration).
- `server/` — Route handlers, service layer, server actions, and DB. Call exported handlers directly without starting a server; validate contracts with zod schemas when applicable.
- `middleware/` — Next.js middleware (auth, intl, feature flags). Invoke the exported middleware with `NextRequest` mocks; assert rewrites, redirects, and headers.

Naming convention: `*.int.test.ts[x]`.

## Tools

- Vitest — test runner
- `@testing-library/react` — DOM testing
- MSW — network mocking for client tests
- DB strategy — use SQLite in-memory for Prisma (beforeAll migrate, beforeEach truncate) or Testcontainers for Postgres (optional, when needed)
- Next helpers — mock `next/navigation`, `next/headers` as needed

## What To Test

- Page shells with app providers (React Query, Zustand, theming)
- Navigation behaviors and URL state
- React Query contracts (query keys, invalidation, cache hydration)
- Route handlers with real service layer
- Server actions and basic DB flows
- Middleware behavior (auth, i18n, feature flags)
- Auth flows across client/middleware/server boundaries

## What Not To Test

- Pure presentational components → unit tests
- Pure type-level logic → `tsd`/`expectTypeOf`
- CSS/theme tokens
- Full page routing and real browser interactions → E2E tests

## Commands

- Run once: `bun run test:integration`
- Watch: `bun run test:integration:watch`

Integration tests count toward coverage; target 70% (slightly lower than unit tests at 80%).

## Minimal First 5

1. HomePage data load (client)
2. Users route handler GET (server)
3. Create user action (server)
4. Auth middleware (middleware)
5. Settings page URL state (client)

See `docs/testing-guide.md` and `docs/e2e-testing-guide.md` for related patterns and best practices.
