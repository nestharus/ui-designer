import { createHighlighter, type BundledLanguage, type BundledTheme } from 'shiki';

let highlighterInstance: Awaited<ReturnType<typeof createHighlighter>> | null = null;

export async function highlightCode(
  code: string,
  lang: BundledLanguage = 'typescript',
  theme: BundledTheme = 'nord'
): Promise<string> {
  highlighterInstance ??= await createHighlighter({
    themes: [theme],
    langs: [lang],
  });

  return highlighterInstance.codeToHtml(code, {
    lang,
    theme,
  });
}
