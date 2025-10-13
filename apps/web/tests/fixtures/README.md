# Test Fixtures

Fixtures provide reusable test data, mock factories, and utilities shared across tests.

Typical contents:

- Mock builders (e.g., `createMockProject()`, `createMockUser()`)
- Shared setup helpers (e.g., `setupTestQueryClient()`, `setupTestStore()`)
- Common assertions and matchers

Guidelines:

- Keep fixtures pure and framework-agnostic when possible
- Avoid per-test side effects; return data/functions for tests to use

Fixtures can be imported by both unit and integration tests under `apps/web/tests/`.
