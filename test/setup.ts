// Vitest global setup file
import { beforeAll, afterAll, afterEach } from 'vitest';

// Use this to perform one-time, global setup before any tests run.
// Typical tasks:
// - Configure test environment variables (e.g., process.env.*)
// - Mock or polyfill global APIs (fetch, crypto, WebSocket) if needed
// - Initialize in-memory stores/DBs or start lightweight test servers
// - Set global fixtures or enable fake timers when appropriate
beforeAll(() => {
  // Intentionally left blank. Add global setup here when needed.
});

// Runs after every test. Keep tests isolated and deterministic.
// Typical tasks:
// - Restore/clear mocks and spies (vi.restoreAllMocks(), vi.clearAllMocks())
// - Reset modules/state between tests (vi.resetModules())
// - Clear timers/intervals and pending tasks (vi.clearAllTimers())
// - Cleanup any temporary files or side effects created by a test
afterEach(() => {
  // Reserved for per-test cleanup if needed in the future.
});

// One-time teardown after the full test suite completes.
// Typical tasks:
// - Close DB connections or stop test servers
// - Dispose of any global resources created in beforeAll
// - Reset environment overrides back to defaults
afterAll(() => {
  // Intentionally left blank. Add global teardown here when needed.
});

// Vitest 3.2.4+ provides native expect.soft; no custom polyfill required.
