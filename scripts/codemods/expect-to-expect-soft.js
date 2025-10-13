/**
 * Codemod: Convert expect(...) to expect.soft(...)
 *
 * Usage:
 *   bun run codemod:expect-soft
 *
 * Behavior:
 * - Preserves `await` for Playwright async patterns: `await expect(...)` becomes `await expect.soft(...)`.
 * - Handles both Vitest (sync) and Playwright (async) assertions.
 *
 * Notes:
 * - Only targets test files via the CLI globs in package.json.
 * - Skips Bun shim test (test/vitest-shim.test.ts).
 */
export default function transformer(file, api) {
  const j = api.jscodeshift;
  const source = file.source;
  const filePath = file.path || '';

  // Skip Bun shim test
  if (filePath.includes('test/vitest-shim.test.ts')) {
    return source;
  }

  const root = j(source);
  let changed = false;

  for (const p of root
    .find(j.CallExpression)
    .filter((p) => {
      const callee = p.value.callee;
      if (!(callee && callee.type === 'Identifier' && callee.name === 'expect')) {
        return false;
      }
      const parent = p.parentPath?.value;
      const isAssertions =
        j.MemberExpression.check(parent) &&
        ['assertions', 'hasAssertions'].includes(parent.property?.name);
      return !isAssertions;
    })
    .paths()) {
    p.get('callee').replace(j.memberExpression(j.identifier('expect'), j.identifier('soft')));
    changed = true;
  }

  return changed ? root.toSource({ quote: 'single' }) : null;
}
