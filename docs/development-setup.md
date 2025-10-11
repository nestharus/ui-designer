# Development Setup

## Prerequisites

- Bun 1.3.x (`bun --version` should report 1.3.\*)
- TypeScript 5.9 (installed as a workspace devDependency)
- Ambient types via `@types/bun@1.3.0` and `@types/node` (installed in the workspace). These ensure correct type coverage, including Next.js 15 compatibility.
- Git
- A code editor (VS Code recommended)

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ui-designer
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Build Shared Type Definitions

```bash
bun run setup
```

This builds the `@ui-designer/shared-types` package which is required by other workspace packages.

### 4. Install Git Hooks

```bash
bun run prepare
```

This installs Lefthook git hooks for automated code quality checks.

### 5. Verify Setup

Run the following commands to ensure everything is working:

```bash
bun run type-check
bun run lint
bun run test
```

If all commands complete successfully, you're ready to start developing!

Tip: Configure your editor to use the workspace TypeScript version. For VS Code, add to `.vscode/settings.json`:

```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

## Project Structure

```text
ui-designer/
├── apps/           # Frontend applications (Next.js)
├── packages/       # Shared libraries
│   └── shared-types/  # TypeScript type definitions
├── services/       # Backend services (Vert.x, LangGraph)
├── styles/         # Global styles and design tokens
├── docs/           # Documentation
└── plans/          # Planning documents and research
```

## Adding New Packages

### Creating a New Package

> **Important:** Follow the complete package setup guide in [TypeScript and Vitest Configuration Guide](./typescript-vitest-config.md#adding-a-new-package) to avoid configuration issues.

Quick checklist:

1. Create package directory under `packages/`, `apps/`, or `services/`
2. Add `package.json` with proper scripts
3. Create `tsconfig.json` for building
4. Create `tsconfig.vitest.json` for testing
5. Create `vitest.config.ts` if the package has tests
6. Update root `tsconfig.json` references if needed

See the [full guide](./typescript-vitest-config.md#adding-a-new-package) for detailed instructions and templates.

### Package Naming Convention

- Apps: `@ui-designer/app-name`
- Packages: `@ui-designer/package-name`
- Services: `@ui-designer/service-name`

## Troubleshooting

### "Module not found" errors

1. Ensure you've run `bun run setup` to build shared types
2. Check that the package is listed in workspace dependencies
3. Try removing `node_modules` and running `bun install` again

### Missing dependencies or peer dependency warnings

If you encounter errors like:

- `Cannot find package 'package-json-from-dist'`
- `Cannot find module '@eslint-community/eslint-utils'`
- `No locally installed 'turbo' found`

**Solution:** Clean install dependencies:

```bash
# Remove node_modules and cache
rm -rf node_modules .bun-cache

# Reinstall everything
bun install
```

PowerShell (Windows) equivalent: `Remove-Item -Recurse -Force node_modules, .bun-cache; bun install`

**Note:** Turbo should be installed locally (it's in devDependencies). If you see warnings about using global turbo, ensure `bun install` completed successfully.

### Type checking fails

1. Verify all workspace packages are built: `bun run build`
2. Check for circular dependencies
3. Ensure `tsconfig.json` references are correct

### Git hooks not running

1. Reinstall hooks: `bun run prepare`
2. Check `.lefthook.yml` configuration
3. Verify Lefthook is installed: `bunx lefthook version`

### Commands fail with "turbo not found" or similar

If commands like `bun run lint` or `bun run clean` fail:

1. Ensure turbo is installed locally: `bun add -d turbo`
2. Check that all dependencies are installed: `bun install`
3. If issues persist, try a clean install (see "Missing dependencies" above)

## Next Steps

- Read the [Development Workflow](./development-workflow.md) guide
- Review the [Code Style Guide](./code-style-guide.md)
- Check out the [Testing Guide](./testing-guide.md)
