import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GET } from '../route';

import type { NextRequest } from 'next/server';

// Hoist constructable mock for ImageResponse
const { ImageResponseMock } = vi.hoisted(() => {
  interface ImageOptions {
    width: number;
    height: number;
    headers: Record<string, string>;
    fonts: readonly { name: string; data: ArrayBuffer; style: string; weight: number }[];
  }
  const ImageResponseMock = vi.fn((jsx: unknown, options: ImageOptions) => {
    return { jsx, options } as { jsx: unknown; options: ImageOptions };
  });
  return { ImageResponseMock };
});

vi.mock('next/og', () => ({
  ImageResponse: ImageResponseMock,
}));

// Import after mocks are set up

describe('API /api/og GET', () => {
  beforeEach(() => {
    ImageResponseMock.mockClear();
  });

  it('returns an ImageResponse with fonts and headers', async () => {
    // Arrange
    const fontUrl = 'https://example.com/inter-700.woff2';

    const fetchMock = async (url: RequestInfo | URL): Promise<Response> => {
      let s: string;
      if (typeof url === 'string') s = url;
      else if (url instanceof URL) s = url.href;
      else s = (url as Request).url;
      if (s.includes('fonts.googleapis.com')) {
        return new Response(`@font-face { src: url(${fontUrl}) format('woff2'); }`, {
          headers: { 'Content-Type': 'text/css' },
        });
      }
      // font bytes
      return new Response(new TextEncoder().encode('fontdata'));
    };

    // override global for test
    globalThis.fetch = fetchMock as typeof fetch;

    // Act
    await GET({
      url: 'https://example.com/api/og?title=Title&subtitle=Sub',
    } as unknown as NextRequest);

    // Assert
    expect.soft(ImageResponseMock).toHaveBeenCalledTimes(1);
    const [, options] = ImageResponseMock.mock.calls[0] as [unknown, any];
    expect.soft(options.width).toBe(1200);
    expect.soft(options.height).toBe(630);
    expect.soft(options.headers['Cache-Control']).toContain('public');
    expect.soft(options.fonts).toHaveLength(2);
  });

  it('returns 400 for invalid params', async () => {
    // Arrange
    const long = 'a'.repeat(101);

    // Act
    const res = await GET({
      url: `https://example.com/api/og?title=${long}`,
    } as unknown as NextRequest);

    // Assert
    expect.soft((res as Response).status).toBe(400);
    const body = await (res as Response).json();
    expect.soft(body.error).toBe('Invalid query parameters');
  });
});
