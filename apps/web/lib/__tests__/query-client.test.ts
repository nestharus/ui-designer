import { describe, it, expect } from 'vitest';

import { getQueryClient } from '../query-client';

describe('getQueryClient', () => {
  it('returns a new QueryClient with default options', () => {
    // Arrange / Act
    const qc = getQueryClient();
    const defaults = qc.getDefaultOptions();

    // Assert
    expect.soft(defaults.queries?.staleTime).toBe(60 * 1000);
    expect.soft(defaults.queries?.refetchOnWindowFocus).toBe(false);
  });

  it('creates a fresh instance on each call', () => {
    // Arrange / Act
    const a = getQueryClient();
    const b = getQueryClient();

    // Assert
    expect.soft(a).not.toBe(b);
  });
});
