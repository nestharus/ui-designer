/**
 * Server-side integration test: validates a route handler with real parsing
 * and response shape (no server spin-up).
 */
import { NextRequest, NextResponse } from 'next/server';
import { describe, it, expect } from 'vitest';

// Using hello route as template for users route
import { GET } from '@/app/api/hello/route';

describe('Integration: API route GET /api/hello', () => {
  it('returns expected JSON payload', async () => {
    const req = new NextRequest('https://example.com/api/hello?name=Sam');

    const res = GET(req);

    expect.soft(res).toBeInstanceOf(NextResponse);
    expect.soft(res.status).toBe(200);

    const data = (await res.json()) as { message: string; timestamp: string };
    expect.soft(data).toBeDefined();
    expect.soft(data.message).toBe('Hello, Sam!');
    expect.soft(typeof data.timestamp).toBe('string');
  });
});
