# Linting Guide

## Overview

This project uses a comprehensive ESLint configuration that combines best practices from multiple sources to ensure code quality, consistency, and modern JavaScript/TypeScript patterns.

## Configuration Philosophy

Our linting setup is inspired by **XO's opinionated approach** but adapted for Next.js/React development. The configuration is optimized for monorepo structure, applying React rules only to files that actually use React (`.tsx`, `.jsx`), preventing warnings in non-React packages.

Instead of using XO's full configuration (which can conflict with ESLint 9's flat config), we've cherry-picked the most valuable rules from:

- **Unicorn** - Modern JavaScript/TypeScript patterns (XO's core)
- **TypeScript ESLint** - Type safety and consistency
- **React & React Hooks** - React best practices
- **Next.js** - Next.js-specific optimizations
- **Import** - Import organization and dependency management
- **JSX A11y** - Accessibility standards
- **Drizzle** - Database query safety (if using Drizzle ORM)

## Why Not Full XO?

**XO** is an excellent zero-config linter that bundles many plugins and opinions. However:

1. **Compatibility**: XO's current version has compatibility issues with ESLint 9's flat config format
2. **Flexibility**: We need Next.js/React-specific configurations that XO doesn't prioritize
3. **Granular Control**: Cherry-picking rules gives us better control over strictness levels

**Our approach**: Use XO's philosophy (strict, opinionated, modern) but implement it through individual plugins.

## Installed Packages

```json
{
  "eslint": "^9.37.0",
  "typescript-eslint": "^8.46.0",
  "eslint-plugin-react": "^7.37.5",
  "eslint-plugin-react-hooks": "^7.0.0",
  "@next/eslint-plugin-next": "^15.5.4",
  "eslint-plugin-import": "^2.32.0",
  "eslint-plugin-jsx-a11y": "^6.10.2",
  "eslint-plugin-unicorn": "^61.0.2",
  "eslint-plugin-drizzle": "^0.2.3",
  "eslint-config-prettier": "^10.1.8"
}
```

## Key Features

### 1. Modern JavaScript/TypeScript Patterns (Unicorn)

Enforces modern ES6+ patterns and best practices:

- ✅ Prefer `for...of` over traditional `for` loops
- ✅ Use `String#codePointAt()` over `String#charCodeAt()`
- ✅ Prefer `Array#find()` over filter + index access
- ✅ Use nullish coalescing (`??`) appropriately
- ✅ Prefer `node:` protocol for Node.js imports
- ✅ Consistent filename casing (kebab-case or PascalCase)

### 2. TypeScript Strictness

Enhanced type safety beyond the recommended config:

- ✅ Consistent type imports (`import type`)
- ✅ Consistent type exports (`export type`)
- ✅ No unnecessary conditions
- ✅ Prefer optional chaining
- ✅ No floating promises
- ✅ Prefer nullish coalescing over logical OR

### 3. Import Organization

Automatic import sorting and organization:

```typescript
// Correct order:
import { builtin } from 'node:fs'; // 1. Node.js builtins
import { external } from 'react'; // 2. External packages
import { internal } from '@/lib/utils'; // 3. Internal aliases
import { sibling } from './sibling'; // 4. Siblings
import type { Types } from './types'; // 5. Type imports
```

### 4. React & Next.js Best Practices

- ✅ React Hooks rules enforcement
- ✅ Next.js Core Web Vitals
- ✅ No `React` import needed (Next.js 13+)
- ✅ Accessibility checks
- ✅ React rules only applied to React files (`.tsx`, `.jsx`)
- ✅ No warnings in non-React packages

### 5. Database Safety (Drizzle)

If using Drizzle ORM:

- ✅ Enforce `WHERE` clause in `DELETE` operations
- ✅ Enforce `WHERE` clause in `UPDATE` operations

## Running Linting

```bash
# Lint all packages
bun run lint

# Lint specific package
cd apps/web && bun run lint
cd packages/shared-types && bun run lint

# Auto-fix issues
bun run lint --fix
cd apps/web && bun run lint --fix
```

## Common Issues and Fixes

### 1. Type Import Violations

**Error**: `Imports "Type" are only used as type`

**Fix**: Use `import type` syntax:

```typescript
// ❌ Wrong
import { NextRequest } from 'next/server';

// ✅ Correct
import { type NextRequest } from 'next/server';
// or
import type { NextRequest } from 'next/server';
```

### 2. Prefer Nullish Coalescing

**Error**: `Prefer using nullish coalescing operator (??)`

**Fix**: Use `??` instead of `||` when checking for null/undefined:

```typescript
// ❌ Wrong (also treats empty string, 0, false as falsy)
const value = searchParams.get('key') || 'default';

// ✅ Correct (only null/undefined trigger default)
const value = searchParams.get('key') ?? 'default';
```

### 3. Import Order

**Error**: `Import in body of module; reorder to top`

**Fix**: Move all imports to the top of the file, before any code:

```typescript
// ❌ Wrong
const helper = () => {};
import { something } from './module';

// ✅ Correct
import { something } from './module';

const helper = () => {};
```

### 4. Filename Case

**Error**: `Filename is not in kebab-case or PascalCase`

**Fix**: Use either kebab-case or PascalCase:

```text
✅ user-profile.tsx
✅ UserProfile.tsx
❌ user_profile.tsx
❌ userProfile.tsx
```

### 5. Better Regex

**Error**: `/Pattern/i can be optimized to /pattern/i`

**Fix**: Remove unnecessary case-insensitive flag when pattern is already lowercase:

```typescript
// ❌ Wrong
const regex = /Hello World/i;

// ✅ Correct
const regex = /hello world/i;
```

## Disabling Rules

### Inline Disabling

```typescript
// Disable for next line
// eslint-disable-next-line unicorn/prevent-abbreviations
const btn = document.querySelector('button');

// Disable for entire file
/* eslint-disable unicorn/prevent-abbreviations */
```

### Configuration Override

Add to `eslint.config.js`:

```javascript
{
  files: ['**/*.test.ts'],
  rules: {
    'no-console': 'off', // Allow console in tests
  }
}
```

## Rules We Intentionally Disabled

Some XO/Unicorn rules are too strict for our use case:

- `unicorn/prevent-abbreviations` - Common abbreviations (btn, props, etc.) are acceptable
- `unicorn/no-null` - `null` is valid in many APIs
- `unicorn/prefer-module` - CommonJS still needed in some configs
- `unicorn/no-array-reduce` - `reduce` is useful and readable
- `unicorn/no-array-for-each` - `forEach` is readable for side effects

## Integration with Prettier

Our ESLint config is compatible with Prettier. Prettier handles formatting, ESLint handles code quality:

- **Prettier**: Formatting (indentation, line breaks, quotes)
- **ESLint**: Code quality (patterns, best practices, bugs)

The `eslint-config-prettier` package disables all ESLint formatting rules that conflict with Prettier.

## CI/CD Integration

Linting runs automatically in CI:

```yaml
# .github/workflows/ci.yml
- name: Lint
  run: bun run lint
```

Pre-commit hooks also run linting via Lefthook:

```yaml
# lefthook.yml
pre-commit:
  commands:
    lint:
      run: bun run lint
```

## Answering Your Questions

### Can linting be simplified using Drizzle + XO?

**Drizzle** is an ORM, not a linting tool. `eslint-plugin-drizzle` provides database-specific safety rules (like enforcing WHERE clauses), which we've included.

**XO** would simplify configuration but has compatibility issues with ESLint 9. Our approach gives you XO's benefits (strict, modern rules) without the compatibility problems.

### Does XO conflict with Next.js/React best practices?

**No**, XO doesn't conflict with Next.js/React best practices. The "conflicts" mentioned in the plan refer to:

1. **Code reformatting**: XO is very strict and would require reformatting existing code
2. **Configuration complexity**: Integrating XO with Next.js-specific plugins requires workarounds
3. **ESLint 9 compatibility**: XO's current version has issues with flat config

Our solution provides XO's strictness through Unicorn while maintaining full Next.js/React compatibility.

## Summary

This configuration provides:

- ✅ **Strict type safety** - Catch type errors early
- ✅ **Modern patterns** - Enforce ES6+ best practices
- ✅ **Consistent style** - Automatic import sorting and organization
- ✅ **Framework-specific** - Next.js and React optimizations
- ✅ **Accessibility** - Built-in a11y checks
- ✅ **Database safety** - Drizzle ORM protections
- ✅ **Auto-fixable** - Most issues can be fixed automatically

The configuration is opinionated (like XO) but practical for Next.js development.
