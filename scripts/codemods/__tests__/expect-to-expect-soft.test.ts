import { describe, it, expect as vexpect } from 'vitest';
// @ts-expect-error jscodeshift types may not align in this context
import jscodeshift from 'jscodeshift';
import transformer from '../expect-to-expect-soft.js';

function runTransform(input: string): string {
  const out = transformer({ source: input, path: 'input.ts' }, { jscodeshift });
  return out ?? input;
}

describe('expect-to-expect-soft codemod', () => {
  it('converts direct expect(...) calls', () => {
    const input = 'expect(value).toBe(1)';
    const output = runTransform(input);
    vexpect(output).toContain('expect.soft(value).toBe(1)');
  });

  it('preserves await with resolves chain', () => {
    const input = 'async function t(){ await expect(promise).resolves.toBe(1); }';
    const output = runTransform(input);
    vexpect(output).toContain('await expect.soft(promise).resolves.toBe(1)');
  });

  it('preserves await with locator matcher', () => {
    const input = 'async function t(){ await expect(locator).toBeVisible(); }';
    const output = runTransform(input);
    vexpect(output).toContain('await expect.soft(locator).toBeVisible()');
  });

  it('does not change expect.assertions/hasAssertions', () => {
    const input = 'expect.assertions(1); expect.hasAssertions();';
    const output = runTransform(input);
    vexpect(output).toBe(input);
  });
});

