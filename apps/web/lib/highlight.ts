import 'server-only';
import { LRUCache } from 'lru-cache';
import { createHighlighter, type BundledLanguage, type BundledTheme } from 'shiki';

// Bound the cache to prevent unbounded memory growth in long-running processes.
// Configurable via HIGHLIGHTER_CACHE_SIZE; defaults to 64 entries.
const MAX_HIGHLIGHTERS = Number(process.env.HIGHLIGHTER_CACHE_SIZE) || 64;
type Highlighter = Awaited<ReturnType<typeof createHighlighter>>;
interface Disposable {
  dispose: () => void;
}
function isDisposable(value: unknown): value is Disposable {
  return typeof (value as { dispose?: unknown }).dispose === 'function';
}

const highlighters = new LRUCache<string, Highlighter>({
  max: MAX_HIGHLIGHTERS,
  disposeAfter: (value) => {
    // shiki highlighter may expose dispose; call if present
    try {
      if (isDisposable(value)) {
        value.dispose();
      }
    } catch {
      // ignore dispose failures
    }
  },
});

// Track in-flight highlighter creations to dedupe concurrent requests for the same key
const pending = new Map<string, Promise<Highlighter>>();

export async function highlightCode(
  code: string,
  lang: BundledLanguage = 'typescript',
  theme: BundledTheme = 'nord',
): Promise<string> {
  const key = `${theme}:${lang}`;
  let hl: Highlighter | undefined = highlighters.get(key);
  if (!hl) {
    let p: Promise<Highlighter> | undefined = pending.get(key);
    if (!p) {
      p = createHighlighter({ themes: [theme], langs: [lang] });
      pending.set(key, p);
    }
    try {
      hl = await p;
      highlighters.set(key, hl);
    } finally {
      // Cleanup pending entry for this key; safe after promise settles
      // eslint-disable-next-line drizzle/enforce-delete-with-where
      pending.delete(key);
    }
  }
  return hl.codeToHtml(code, { lang, theme });
}
