import { describe, it, expect, vi, beforeEach } from 'vitest';

// Hoist spies so they can be referenced in vi.mock
const { createHighlighterSpy, codeToHtmlSpy } = vi.hoisted(() => {
  const codeToHtmlSpy = vi.fn(
    (code: string, opts: { theme: string; lang: string }) =>
      `<pre>${opts.theme}:${opts.lang}:${code}</pre>`,
  );
  const createHighlighterSpy = vi.fn(async () => ({ codeToHtml: codeToHtmlSpy }));
  return { createHighlighterSpy, codeToHtmlSpy };
});

vi.mock('shiki', () => ({
  createHighlighter: createHighlighterSpy,
}));

describe('highlightCode', () => {
  beforeEach(() => {
    createHighlighterSpy.mockClear();
    codeToHtmlSpy.mockClear();
  });

  it('creates a highlighter once per theme:lang and caches it', async () => {
    // Arrange
    vi.resetModules();
    const { highlightCode } = await import('../highlight');

    // Act
    const html1 = await highlightCode('const x = 1;', 'typescript', 'nord');
    const html2 = await highlightCode('const y = 2;', 'typescript', 'nord');

    // Assert
    expect.soft(createHighlighterSpy).toHaveBeenCalledTimes(1);
    expect.soft(codeToHtmlSpy).toHaveBeenCalledTimes(2);
    expect.soft(html1).toContain('nord:typescript');
    expect.soft(html2).toContain('nord:typescript');
  });

  it('creates a new highlighter for a different key', async () => {
    // Arrange
    vi.resetModules();
    const { highlightCode } = await import('../highlight');

    // Act
    await highlightCode('a', 'typescript', 'nord');
    await highlightCode('b', 'tsx' as any, 'poimandres' as any);

    // Assert
    expect.soft(createHighlighterSpy).toHaveBeenCalledTimes(2);
  });
});
