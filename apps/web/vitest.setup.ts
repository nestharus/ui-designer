import { expect, afterEach, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';

// Add jest-dom matchers to Vitest's expect
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router and helpers used in components
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  // Used by app/emotion-registry in client components
  useServerInsertedHTML: (cb: () => any) => {
    // call once to simulate server insertion hook; ignore return
    try {
      return cb();
    } catch {
      // no-op in tests
      return null;
    }
  },
}));

// Stub Next.js server-only module for tests
vi.mock('server-only', () => ({}));
