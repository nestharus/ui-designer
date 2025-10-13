import { describe, it, expect, vi } from 'vitest';

import type { NextRequest } from 'next/server';

// Hoist constructable mock for ImageResponse so import of GET doesn't error
const { ImageResponseMock } = vi.hoisted(() => {
  const ImageResponseMock = vi.fn();
  return { ImageResponseMock };
});

vi.mock('next/og', () => ({
  ImageResponse: ImageResponseMock,
}));

describe('API /api/og GET (font CSS missing url)', () => {
  it('throws when font URL cannot be found in CSS', async () => {
    const cssWithoutUrl = '@font-face { font-family: Inter; }';
    const fetchMock = async (url: RequestInfo | URL): Promise<Response> => {
      let s: string;
      if (typeof url === 'string') s = url;
      else if (url instanceof URL) s = url.href;
      else s = (url as Request).url;
      if (s.includes('fonts.googleapis.com')) {
        return new Response(cssWithoutUrl, { headers: { 'Content-Type': 'text/css' } });
      }
      return new Response(new TextEncoder().encode('fontdata'));
    };
    globalThis.fetch = fetchMock as typeof fetch;

    const { GET } = await import('../route');

    await expect
      .soft(GET({ url: 'https://example.com/api/og' } as unknown as NextRequest))
      .rejects.toThrow(/Failed to find Inter font URL/);
  });
});
