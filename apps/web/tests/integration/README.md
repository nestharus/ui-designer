# Integration Tests

Integration tests validate cross-cutting scenarios that span multiple features, modules, or layers.

Examples:

- A feature that uses multiple stores, hooks, and API calls
- Server actions that interact with backend services and return data to the client
- Complex user flows involving multiple components and state changes

Commands:

- Run once: `bun run test:integration`
- Watch: `bun run test:integration:watch`

Coverage thresholds: 70% for branches, functions, lines, and statements (slightly lower than unit tests at 80%).

These tests use a dedicated Vitest config in `apps/web/vitest.config.integration.ts`.
