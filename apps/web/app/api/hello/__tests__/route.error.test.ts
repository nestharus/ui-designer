import { describe, it, expect, vi, beforeEach } from 'vitest';

import type { NextRequest } from 'next/server';

// Mock zod to force a parse failure path
vi.mock('zod', () => ({
  z: {
    object: () => ({
      safeParse: () => ({ success: false, error: { issues: [{ code: 'custom' }] } }),
    }),
    string: () => ({ optional: () => ({}) }),
    treeifyError: () => ({ code: 'ZOD_ERROR' }),
  },
}));

describe('API /api/hello GET (error path)', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns 400 when zod parsing fails (forced)', async () => {
    const { GET } = await import('../route');
    const res = GET({ url: 'https://example.com/api/hello?name=x' } as unknown as NextRequest);

    expect.soft((res as Response).status).toBe(400);
    const json = await (res as Response).json();
    expect.soft(json.error).toBe('Invalid query parameters');
  });
});
