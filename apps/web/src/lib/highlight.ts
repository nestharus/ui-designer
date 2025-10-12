import { createHighlighter, type BundledLanguage, type BundledTheme } from 'shiki';

const highlighters = new Map<string, Awaited<ReturnType<typeof createHighlighter>>>();

export async function highlightCode(
  code: string,
  lang: BundledLanguage = 'typescript',
  theme: BundledTheme = 'nord',
): Promise<string> {
  const key = `${theme}:${lang}`;
  if (!highlighters.has(key)) {
    const hl = await createHighlighter({ themes: [theme], langs: [lang] });
    highlighters.set(key, hl);
  }
  return highlighters.get(key)!.codeToHtml(code, { lang, theme });
}
