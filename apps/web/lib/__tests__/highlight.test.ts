import { describe, it, expect, vi, beforeEach } from 'vitest';

type CodeToHtml = (code: string, opts: { theme: string; lang: string }) => string;

function makeHighlighterAfterDelay(ms: number, fn: CodeToHtml) {
  return new Promise<{ codeToHtml: CodeToHtml }>((resolve) => {
    setTimeout(() => {
      resolve({ codeToHtml: fn });
    }, ms);
  });
}

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

  it('dedupes concurrent creation for the same key', async () => {
    vi.resetModules();
    // Delay highlighter creation to allow concurrent calls to stack
    createHighlighterSpy.mockImplementationOnce(() => makeHighlighterAfterDelay(5, codeToHtmlSpy));
    const { highlightCode } = await import('../highlight');

    const p1 = highlightCode('x', 'typescript', 'nord');
    const p2 = highlightCode('y', 'typescript', 'nord');
    const [h1, h2] = await Promise.all([p1, p2]);

    expect.soft(h1).toContain('nord:typescript');
    expect.soft(h2).toContain('nord:typescript');
    expect.soft(createHighlighterSpy).toHaveBeenCalledTimes(1);
  });

  it('disposes evicted highlighters via LRU disposeAfter', async () => {
    vi.resetModules();
    // Set small cache to force eviction
    const prev = process.env.HIGHLIGHTER_CACHE_SIZE;
    process.env.HIGHLIGHTER_CACHE_SIZE = '1';
    try {
      const disposeSpy = vi.fn();
      createHighlighterSpy.mockImplementation(async () => ({
        codeToHtml: codeToHtmlSpy,
        dispose: disposeSpy,
      }));
      const { highlightCode } = await import('../highlight');

      await highlightCode('a', 'typescript', 'nord');
      await highlightCode('b', 'tsx' as any, 'poimandres' as any);

      // First highlighter should be disposed after eviction
      expect.soft(disposeSpy).toHaveBeenCalled();
    } finally {
      if (prev === undefined) delete process.env.HIGHLIGHTER_CACHE_SIZE;
      else process.env.HIGHLIGHTER_CACHE_SIZE = prev;
    }
  });

  it('gracefully ignores dispose errors on eviction', async () => {
    vi.resetModules();
    const prev = process.env.HIGHLIGHTER_CACHE_SIZE;
    process.env.HIGHLIGHTER_CACHE_SIZE = '1';
    try {
      const disposeSpy = vi.fn(() => {
        throw new Error('dispose failed');
      });
      createHighlighterSpy.mockImplementation(async () => ({
        codeToHtml: codeToHtmlSpy,
        dispose: disposeSpy,
      }));
      const { highlightCode } = await import('../highlight');

      await highlightCode('a', 'typescript', 'nord');
      await highlightCode('b', 'tsx' as any, 'poimandres' as any);

      expect.soft(disposeSpy).toHaveBeenCalled();
    } finally {
      if (prev === undefined) delete process.env.HIGHLIGHTER_CACHE_SIZE;
      else process.env.HIGHLIGHTER_CACHE_SIZE = prev;
    }
  });
});
