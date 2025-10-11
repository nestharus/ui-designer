# Font Loading Guide

## Current Implementation

The project currently uses `@font-face` declarations in `styles/globals.css` to load fonts from Google Fonts CDN with `font-display: swap` to prevent FOUT/FOIT.

### Fonts Loaded

- **Inter** (Sans Serif): weights 400, 500, 600, 700
- **IBM Plex Serif**: weights 400, 500, 600, 700
- **IBM Plex Mono**: weights 400, 500, 600, 700

## Recommended: Next.js `next/font` (When App is Created)

When you create a Next.js app in the `apps/` directory, migrate to `next/font` for optimal performance:

### Step 1: Create Font Configuration

Create `apps/your-app/lib/fonts.ts`:

```typescript
import { Inter, IBM_Plex_Serif, IBM_Plex_Mono } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const ibmPlexSerif = IBM_Plex_Serif({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-serif',
  display: 'swap',
});

export const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
});
```

### Step 2: Apply Fonts in Root Layout

In `apps/your-app/app/layout.tsx`:

```typescript
import type { Metadata } from 'next';
import { inter, ibmPlexSerif, ibmPlexMono } from '@/lib/fonts';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'UI Designer',
  description: 'Your app description',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${ibmPlexSerif.variable} ${ibmPlexMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
```

### Step 3: Update CSS Variables (Optional)

If using `next/font`, you can simplify the CSS variables in `styles/globals.css`:

```css
@theme {
  /* Typography - using Next.js font variables */
  --font-sans:
    var(--font-sans), system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-serif: var(--font-serif), Georgia, serif;
  --font-mono: var(--font-mono), SFMono-Regular, Menlo, monospace;
}
```

### Step 4: Remove @font-face Declarations

Once `next/font` is implemented, remove the `@font-face` declarations from `styles/globals.css` as Next.js will handle font loading automatically.

## Benefits of next/font

1. **Automatic Font Optimization**: Next.js automatically optimizes fonts at build time
2. **Zero Layout Shift**: Fonts are loaded with zero cumulative layout shift
3. **No External Requests**: Fonts are self-hosted automatically
4. **Better Performance**: Fonts are preloaded and cached efficiently
5. **Type Safety**: Full TypeScript support

## Current @font-face Approach

The current implementation uses Google Fonts CDN with:

- `font-display: swap` to prevent invisible text
- Proper `unicode-range` for Latin characters
- Multiple weights (400, 500, 600, 700) for each font family
- WOFF2 format for optimal compression

This approach works well but `next/font` provides better optimization when using Next.js.
