// Vitest global setup file
import { beforeAll, afterAll, afterEach, expect } from 'vitest';

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
  // Flush any collected soft assertion failures
  const anyExpect = expect as any;
  const bucket: Error[] | undefined = anyExpect.__softFailures;
  if (bucket && bucket.length > 0) {
    const message = bucket.map((e: Error, i: number) => `#${i + 1} ${e.message}`).join('\n');
    // Reset the bucket for the next test
    anyExpect.__softFailures = [];
    throw new Error(`Soft assertion failures (aggregated):\n${message}`);
  }
});

// One-time teardown after the full test suite completes.
// Typical tasks:
// - Close DB connections or stop test servers
// - Dispose of any global resources created in beforeAll
// - Reset environment overrides back to defaults
afterAll(() => {
  // Intentionally left blank. Add global teardown here when needed.
});

// Polyfill for expect.soft in Vitest.
// Provides soft assertions that collect failures and report them at test end.
{
  const anyExpect = expect as any;
  if (!anyExpect.soft) {
    anyExpect.__softFailures = [] as Error[];
    const makeProxy = (base: any) =>
      new Proxy(
        {},
        {
          get(_t, prop: string) {
            if (prop === 'not') {
              return makeProxy(base.not);
            }
            return (...args: any[]) => {
              try {
                return base[prop](...args);
              } catch (e) {
                anyExpect.__softFailures.push(e as Error);
                // Return a dummy value to allow continued chaining if needed
                return undefined;
              }
            };
          },
        }
      );

    anyExpect.soft = (actual: unknown, message?: string) => makeProxy(expect(actual, message));
  }
}
