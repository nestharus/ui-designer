# TypeScript and Vitest Configuration Guide

## Known Issue: Type-Checking with Bun and Peer Dependencies

### The Problem

When using Bun as a package manager with packages that have peer dependencies (like `@tanstack/react-query`), TypeScript's type-checking can fail with errors from node_modules even when `skipLibCheck: true` is set. This happens because:

1. **Bun symlinks `.ts` source files** from dependencies into `node_modules/.bun/`
2. **TypeScript follows imports** from your source code into these `.ts` files
3. **`skipLibCheck` only skips `.d.ts` files**, not `.ts` source files
4. **`exactOptionalPropertyTypes: true`** in the base config causes strict type errors in dependency code

### The Solution

For packages with peer dependencies that expose `.ts` source files (common with modern libraries), you have two options:

**Option 1: Skip type-check for that package (Recommended)**

Remove or comment out the `type-check` script in the package's `package.json`:

```json
{
  "scripts": {
    // "type-check": "tsc --noEmit --skipLibCheck --project tsconfig.json",
  }
}
```

The package will still be type-checked during:

- Build time (`tsc --build`)
- IDE/editor usage
- When imported by other packages

**Option 2: Use a separate tsconfig for type-checking**

Create a `tsconfig.typecheck.json` that's less strict:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "exactOptionalPropertyTypes": false,
    "skipLibCheck": true
  }
}
```

Then update the script:

```json
{
  "scripts": {
    "type-check": "tsc --noEmit --project tsconfig.typecheck.json"
  }
}
```

### Why This Happens

TypeScript's module resolution follows this path:

1. Your code imports `@tanstack/react-query`
2. Bun has symlinked the package's `.ts` source files to `node_modules/.bun/@tanstack+react-query@.../`
3. TypeScript resolves the import to these `.ts` files (not `.d.ts`)
4. TypeScript type-checks these `.ts` files with your strict settings
5. The library's code doesn't pass your strict `exactOptionalPropertyTypes` check

This is a known limitation when combining:

- Bun's package management (which preserves `.ts` files)
- Strict TypeScript settings
- Libraries with peer dependencies

## Understanding TypeScript's `exclude` Behavior

**Important**: The `exclude` option in TypeScript only affects which files are included as a result of the `include` setting. It does NOT prevent files from being included via:

- `import` statements in your code
- `/// <reference>` directives
- Being specified in the `files` array
- Type references (e.g., `types` in compilerOptions)

**TypeScript automatically excludes `node_modules` by default** unless you explicitly include it in your `include` patterns. You should NOT need to add `node_modules`, `**/node_modules`, or `../../node_modules` to your exclude array. If you find yourself needing these patterns, it usually indicates a configuration issue elsewhere.

### Best Practices for Exclude Patterns

✅ **Do:**

- Only exclude build output directories (`dist`, `.next`, `.turbo`)
- Exclude test files from production builds
- Keep exclude patterns minimal and specific

❌ **Don't:**

- Add multiple variations of `node_modules` exclusions
- Use overly broad glob patterns
- Duplicate exclusions that TypeScript handles automatically

# TypeScript and Vitest Configuration Guide

## Overview

This project uses a carefully structured TypeScript configuration system designed for a Bun-first monorepo with Vitest testing. Understanding this structure is crucial for adding new packages and avoiding configuration errors.

## Configuration Architecture

### Base Configuration (`tsconfig.base.json`)

The base configuration defines settings shared across all packages:

```json
{
  "compilerOptions": {
    "lib": ["ESNext"], // Node/Bun runtime - no DOM needed
    "module": "esnext", // Lowercase for consistency
    "moduleResolution": "bundler", // Bun's module resolution
    "target": "ESNext",
    "strict": true,
    "noEmit": true // Base config doesn't emit
    // ... other strict settings
  }
}
```

**Key Points:**

- Uses `"lib": ["ESNext"]` only - no DOM libraries since this is a Bun/Node backend project
- Frontend apps (Next.js) will add DOM libs in their own configs
- Uses lowercase `"esnext"` for consistency (both work, but lowercase is standard)
- `"moduleResolution": "bundler"` is required for Bun and supports `import.meta`

#### Ambient Types

- Ambient types are provided by the workspace via `@types/bun@1.3.0` and `@types/node`.
- These ensure correct global types for Bun and Node APIs and are required for Next.js 15 compatibility in frontend apps.

### Root Configuration (`tsconfig.json`)

The root config uses TypeScript's project references for the monorepo:

```json
{
  "extends": "./tsconfig.base.json",
  "files": ["vitest.config.ts", "packages/shared-types/vitest.config.ts"],
  "references": [{ "path": "./packages/shared-types" }]
}
```

**Key Points:**

- Extends the base config (proper separation of concerns)
- Explicitly includes vitest.config.ts files so IDEs (especially IntelliJ IDEA) can type-check them correctly
- Uses project references to link workspace packages
- Test-specific configuration is kept separate in `tsconfig.vitest.json`

**Why explicitly include vitest.config.ts files?**

- Ensures IDEs use the correct TypeScript config with `"module": "esnext"` for `import.meta` support
- Without explicit inclusion, some IDEs may not properly associate these files with the correct config

### Vitest Configuration (`tsconfig.vitest.json`)

Specialized config for Vitest test files and config files:

```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "types": ["bun", "vitest/globals"],
    "composite": true
  },
  "include": ["vitest.config.ts", "test/**/*.ts"],
  "exclude": ["packages/**/*", "apps/**/*", "services/**/*"],
  "references": [{ "path": "./packages/shared-types/tsconfig.vitest.json" }]
}
```

**Key Points:**

- Includes `vitest.config.ts` to ensure it's type-checked with correct settings
- Adds Vitest global types (`describe`, `it`, `expect`, etc.)
- Excludes package directories (they have their own configs)
- `composite: true` enables project references (needed for IDE discovery)
- References package vitest configs to link the test configuration hierarchy
- Used independently for testing - not extended by root config

### ESLint Configuration (`tsconfig.eslint.json`)

Separate config for ESLint to check all source files:

```json
{
  "extends": "./tsconfig.base.json",
  "include": [
    "apps/**/*.ts",
    "packages/**/*.ts",
    "services/**/*.ts"
    // ... etc
  ]
}
```

## Package Configuration Pattern

Each package needs TWO TypeScript configs:

### 1. Main Config (`packages/[name]/tsconfig.json`)

For building the package:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "noEmit": false,
    "emitDeclarationOnly": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "src/**/*.test.ts", "vitest.config.ts"]
}
```

**Key Points:**

- Extends base config
- Excludes test files and vitest.config.ts (they use the vitest config)
- Does NOT reference the vitest config (vitest config is independent to avoid noEmit conflicts)
- Emits declaration files for the package

### 2. Vitest Config (`packages/[name]/tsconfig.vitest.json`)

For testing the package:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "types": ["bun", "vitest/globals"],
    "composite": true
  },
  "include": ["vitest.config.ts", "src/**/*", "../../vitest.config.ts", "../../test/setup.ts"]
}
```

**Key Points:**

- Includes BOTH test files AND source files (tests import from source)
- Includes the package's `vitest.config.ts`
- Includes root files that the package's vitest config imports from (if any)
- If your package's `vitest.config.ts` imports from root config or uses root setup files, include them

## Common Issues and Solutions

### Issue: `import.meta` not recognized

**Symptom:**

```text
TS1343: The 'import.meta' meta-property is only allowed when the '--module' option is 'es2020', 'es2022', 'esnext', ...
```

**Cause:** The file using `import.meta` isn't covered by a config with the correct module setting.

**Solution:**

1. Ensure `vitest.config.ts` is included in `tsconfig.vitest.json`
2. Verify the config extends `tsconfig.base.json` which has `"module": "esnext"`
3. Check that your IDE is using the correct config (restart TypeScript server)

### Issue: Test files can't import source files

**Symptom:**

```text
TS6307: File 'X' is not listed within the file list of project
```

**Cause:** The vitest config only includes test files, not the source files they import, OR the vitest.config.ts imports from files not included in the project.

**Solution:**
Include all necessary files in `tsconfig.vitest.json`:

```json
{
  "include": [
    "vitest.config.ts",
    "src/**/*",
    "../../vitest.config.ts", // If your vitest.config.ts imports from root
    "../../test/setup.ts" // If your vitest.config.ts uses root setup
  ]
}
```

**Rule:** Any file that your package's `vitest.config.ts` imports from must be included in the `tsconfig.vitest.json`.

### Issue: Circular or conflicting configs

**Symptom:** TypeScript errors about circular references or conflicting settings.

**Solution:**

- Never have a package's main config extend its vitest config
- Use project references (`"references"`) instead of extends for cross-package deps
- Keep vitest configs independent (no hard references to root files)

## Adding a New Package

Follow this checklist when adding a new package:

### 1. Create Package Structure

```text
packages/new-package/
├── src/
│   ├── __tests__/
│   │   └── index.test.ts
│   └── index.ts
├── package.json
├── tsconfig.json
├── tsconfig.vitest.json
└── vitest.config.ts
```

### 2. Create `package.json`

```json
{
  "name": "@ui-designer/new-package",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "tsc --build",
    "dev": "tsc --build --watch",
    "clean": "rimraf dist",
    "type-check": "tsc --noEmit",
    "lint": "eslint src",
    "test": "vitest run --config ./vitest.config.ts"
  }
}
```

### 3. Create `tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "noEmit": false,
    "emitDeclarationOnly": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "src/**/*.test.ts", "vitest.config.ts"],
  "references": [{ "path": "./tsconfig.vitest.json" }]
}
```

### 4. Create `tsconfig.vitest.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "types": ["bun", "vitest/globals"],
    "composite": true
  },
  "include": [
    "vitest.config.ts",
    "src/**/*",
    "../../vitest.config.ts" // Only if vitest.config.ts has TypeScript imports from root
  ]
}
```

**Important - TypeScript Imports vs Runtime References:**

- **Include in tsconfig**: Only files with TypeScript imports (e.g., `import baseConfig from '../../vitest.config'`)
- **Don't include**: Runtime-only references like Vitest's `setupFiles` paths - these are loaded at runtime, not compile-time
- **composite: true**: Enables project references and helps IDEs (like IntelliJ IDEA) discover the correct config for vitest files
- This avoids unnecessary compile-time coupling to the monorepo root

**Note:** Do NOT add a project reference to `tsconfig.vitest.json` from the main `tsconfig.json`. The vitest config inherits `noEmit: true` from base config, which conflicts with project references.

### 5. Create `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
```

### 6. Update Root References (if needed)

If the package is a dependency of other packages, add it to root `tsconfig.json`:

```json
{
  "references": [{ "path": "./packages/shared-types" }, { "path": "./packages/new-package" }]
}
```

## Frontend Apps (Next.js)

Frontend apps need DOM types. Override in their tsconfig:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## Best Practices

### ✅ Do:

- Keep configs minimal - only override what's necessary
- Use project references for cross-package dependencies
- Include both source and test files in vitest configs
- Use consistent casing (`"esnext"` not `"ESNext"`)
- Restart TypeScript server after config changes

### ❌ Don't:

- Don't add DOM libs to base config (backend project)
- Don't create circular config references
- Don't hard-code paths to root files in package configs
- Don't duplicate settings already in base config
- Don't mix build and test concerns in one config

## Debugging Config Issues

### Check which config TypeScript is using:

1. In VS Code, open a file with errors
2. Command Palette → "TypeScript: Open TS Server Log"
3. Look for "Loading project" messages

### Force TypeScript to reload:

1. Command Palette → "TypeScript: Restart TS Server"
2. Or close and reopen VS Code

### Verify config inheritance:

```bash
# Check effective config for a project
bunx tsc --showConfig --project tsconfig.vitest.json

# Check if vitest.config.ts is covered
bunx tsc --noEmit --project tsconfig.vitest.json
```

**Note:** Running `tsc` on a single file without `--project` flag will NOT use the correct tsconfig. Always specify the project or let your IDE handle it.

### IDE Configuration

**IntelliJ IDEA / WebStorm:**
The root `tsconfig.json` explicitly includes vitest.config.ts files to ensure proper type-checking. If you still see `import.meta` errors:

1. Ensure TypeScript service is using the correct version (Settings → Languages & Frameworks → TypeScript)
2. Check that the TypeScript language service has restarted after config changes
3. Verify the effective TypeScript config being used for the file

**VS Code:**
Add to `.vscode/settings.json`:

Add to `.vscode/settings.json`:

```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

## Why This Structure?

### Separation of Concerns

- Build configs (`tsconfig.json`) handle compilation
- Test configs (`tsconfig.vitest.json`) handle testing
- ESLint config handles linting
- Each has different needs and includes

### Independence

- Packages don't reference root files directly
- Changes to root don't break packages
- Packages can be moved or extracted easily

### Type Safety

- All files are covered by appropriate configs
- `import.meta` works in config files
- Tests can import from source files
- No "file not in project" errors

## Related Documentation

- [Testing Guide](./testing-guide.md) - How to write and run tests
- [Development Setup](./development-setup.md) - Initial project setup
- [Code Style Guide](./code-style-guide.md) - Coding standards

## Troubleshooting Checklist

When you encounter TypeScript errors:

- [ ] Is the file included in any tsconfig?
- [ ] Does the config have the right module setting?
- [ ] Are test files importing from source files that aren't included?
- [ ] Did you restart the TypeScript server?
- [ ] Is there a circular reference between configs?
- [ ] Are you using the right config for the file type?

If all else fails, check the effective configuration:

```bash
bunx tsc --showConfig --project path/to/tsconfig.json
```

### Dependency Issues

If you encounter missing module errors when running commands:

**Symptoms:**

- `Cannot find package 'package-json-from-dist'`
- `Cannot find module '@eslint-community/eslint-utils'`
- `No locally installed 'turbo' found`

**Solution:**

```bash
# Clean install (PowerShell on Windows)
Remove-Item -Recurse -Force node_modules,.bun-cache
bun install

# Or on Unix-like systems
rm -rf node_modules .bun-cache
bun install
```

This ensures all dependencies and their peer dependencies are properly installed.
