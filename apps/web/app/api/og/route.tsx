import { ImageResponse } from 'next/og';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const runtime = 'edge';

// Cache the Inter 400 and 700 fonts at module scope
let inter700FontPromise: Promise<ArrayBuffer> | undefined;
let inter400FontPromise: Promise<ArrayBuffer> | undefined;

async function loadGoogleFont(cssUrl: string): Promise<ArrayBuffer> {
  const cssRes = await fetch(cssUrl, {
    headers: {
      // Hint to get woff2
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36',
    },
    // Edge runtime-friendly fetch
    cache: 'force-cache',
  });
  const css = await cssRes.text();
  const match = /url\((?<url>https:[^)]+\.woff2)\)/.exec(css);
  const fontUrl = match?.groups?.url;
  if (!fontUrl) {
    throw new Error('Failed to find Inter font URL');
  }
  const fontRes = await fetch(fontUrl, { cache: 'force-cache' });
  return fontRes.arrayBuffer();
}

async function getInter700(): Promise<ArrayBuffer> {
  inter700FontPromise ??= loadGoogleFont(
    'https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap',
  );
  return inter700FontPromise;
}

async function getInter400(): Promise<ArrayBuffer> {
  inter400FontPromise ??= loadGoogleFont(
    'https://fonts.googleapis.com/css2?family=Inter:wght@400&display=swap',
  );
  return inter400FontPromise;
}

const ParamsSchema = z.object({
  title: z.string().trim().max(100).optional(),
  subtitle: z.string().trim().max(200).optional(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsed = ParamsSchema.safeParse({
    title: searchParams.get('title') ?? undefined,
    subtitle: searchParams.get('subtitle') ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters', details: parsed.error.issues },
      { status: 400 },
    );
  }

  const title = parsed.data.title ?? 'UI Designer';
  const subtitle = parsed.data.subtitle ?? 'Agentic Design Collaboration';
  const [inter400, inter700] = await Promise.all([getInter400(), getInter700()]);

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #2a7dff 0%, #ff3a86 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 80,
            fontWeight: 700,
            color: 'white',
            marginBottom: 20,
            textAlign: 'center',
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 40,
            color: 'rgba(255, 255, 255, 0.9)',
            textAlign: 'center',
          }}
        >
          {subtitle}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
      fonts: [
        { name: 'Inter', data: inter400, style: 'normal', weight: 400 },
        { name: 'Inter', data: inter700, style: 'normal', weight: 700 },
      ],
    },
  );
}
