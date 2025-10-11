// test/vitest-shim.test.ts
// This file validates that Vitest runs successfully.
// It should be run with Bun's test runner, not Vitest itself.
// Run with: bun test test/vitest-shim.test.ts
//
// Note: This file uses 'bun:test' (Bun's built-in test module) intentionally.
// It's not part of the Vitest test suite - it validates that Vitest works.

import { test, expect } from 'bun:test';

test(
  'run Vitest suite with coverage',
  async () => {
    const proc = Bun.spawn(['bun', 'x', 'vitest', 'run', '--coverage'], {
      stdout: 'inherit',
      stderr: 'inherit',
    });
    const exit = await proc.exited;
    expect(exit).toBe(0);
  },
  { timeout: 30000 }
);
