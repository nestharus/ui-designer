# Command Reference

## Workspace Filtering

This monorepo uses Bun workspaces with Turbo for task orchestration.

### ⚠️ Critical: Why We Use `bun run --filter` Instead of `turbo run --filter=`

**The `turbo` CLI is intentionally NOT in your PATH.** This is a deliberate architectural decision.

When you run:

```bash
bun run dev --filter @ui-designer/package-name
```

Here's what happens:

1. **Bun** filters the workspace to `@ui-designer/package-name`
2. **Bun** looks up the `dev` script in root `package.json`: `"dev": "turbo run dev"`
3. **Bun** executes `turbo run dev` (using the locally installed turbo from `node_modules/.bin/`)
4. **Turbo** runs the `dev` task in the already-filtered workspace

This is **not the same** as running `turbo run dev --filter=@ui-designer/package-name` directly.

### Recommended: Bun Workspace Filtering

Use Bun's built-in `--filter` flag (note: double dash, space-separated):

```bash
# Run command in a specific package
bun run dev --filter @ui-designer/package-name
bun run build --filter @ui-designer/package-name
bun run test --filter @ui-designer/package-name

# Run in package and its dependencies
bun run build --filter @ui-designer/package-name...

# Run in package and its dependents
bun run build --filter ...@ui-designer/package-name
```

**Why this approach:**

- ✅ Bun filters the workspace first (using Bun's native workspace support)
- ✅ Then invokes the script which runs Turbo (leveraging Turbo's caching)
- ✅ Consistent with the "Bun-first" philosophy from AGENTS.md
- ✅ Works without turbo being in PATH

### Alternative: Direct Turbo Filtering

If you need to use Turbo's filtering directly (note: double dash, equals sign):

```bash
# This requires turbo to be in PATH or called through bunx
bunx turbo run dev --filter=@ui-designer/package-name
bunx turbo run build --filter=@ui-designer/package-name
```

**Note:** The `turbo` CLI is not in PATH by default in this project, so you must use `bunx turbo` or stick with `bun run --filter`.

## Command Syntax Comparison

| Approach             | Syntax                                       | Works?              | Recommended? |
| -------------------- | -------------------------------------------- | ------------------- | ------------ |
| Bun workspace filter | `bun run <script> --filter <package>`        | ✅ Yes              | ✅ Yes       |
| Turbo direct (bunx)  | `bunx turbo run <script> --filter=<package>` | ✅ Yes              | ⚠️ Verbose   |
| Turbo direct (bare)  | `turbo run <script> --filter=<package>`      | ❌ No (not in PATH) | ❌ No        |

## Filter Patterns

Both Bun and Turbo support these filter patterns:

```bash
# Exact package
--filter @ui-designer/shared-types

# Package and dependencies (downstream)
--filter @ui-designer/app-name...

# Package and dependents (upstream)
--filter ...@ui-designer/shared-types

# Multiple packages
--filter @ui-designer/pkg-a --filter @ui-designer/pkg-b
```

## Common Commands

### Development

```bash
# All packages
bun run dev

# Specific package
bun run dev --filter @ui-designer/app-name
```

### Building

```bash
# All packages
bun run build

# Specific package
bun run build --filter @ui-designer/shared-types

# Package with dependencies
bun run build --filter @ui-designer/app-name...
```

### Testing

```bash
# All packages
bun run test

# Specific package
bun run test --filter @ui-designer/shared-types

# Watch mode (specific package)
bun run test:watch --filter @ui-designer/shared-types
```

### Cleaning

```bash
# Clean shared type outputs
bun run --filter @ui-designer/shared-types clean
```

### Adding Dependencies

```bash
# Add a runtime dependency (keeps bun.lock consistent)
bun add <package>

# Add a dev dependency
bun add -d <package>
```

Notes:

- Always use `bun add` to maintain a consistent `bun.lock` across the workspace.
- Prefer packages with built-in TypeScript definitions; use `@types/*` only when necessary.

### Type Checking

```bash
# All packages
bun run type-check

# Specific package
bun run type-check --filter @ui-designer/app-name
```

## Why Not Add Turbo to PATH?

The project intentionally keeps `turbo` out of the global PATH to:

1. **Enforce the "Bun-first" workflow** - All commands must go through `bun run`
2. **Ensure consistency** - Single command pattern across the entire monorepo
3. **Leverage Bun's workspace features** - Bun's filtering works seamlessly with Turbo's caching
4. **Prevent confusion** - Avoids mixing Bun syntax (`--filter`) with Turbo syntax (`--filter=`)

If you need direct Turbo access, use `bunx turbo` which runs the locally installed version.

## Troubleshooting

### "turbo: command not found"

If you see this error, you're trying to run `turbo` directly. Use `bun run` instead:

```bash
# ❌ Error: turbo: command not found
turbo run dev --filter=@ui-designer/package-name

# ✅ Solution: Use bun run
bun run dev --filter @ui-designer/package-name
```

### "Command doesn't filter to my package"

Make sure you're using the correct syntax:

```bash
# ✅ Correct - space after --filter
bun run dev --filter @ui-designer/package-name

# ❌ Wrong - equals sign (this is Turbo's syntax, not Bun's)
bun run dev --filter=@ui-designer/package-name
```

### Verifying the Command Works

Test that filtering works correctly:

```bash
# This should only build shared-types, not all packages
bun run build --filter @ui-designer/shared-types

# Check the output - you should see:
# • Packages in scope: @ui-designer/shared-types
# • Running build in 1 packages
```

### Understanding the Execution Flow

To understand what's actually happening, trace the execution:

```bash
# Step 1: Check what script will run
cat package.json | grep '"dev"'
# Output: "dev": "turbo run dev"

# Step 2: Run with filtering
bun run dev --filter @ui-designer/shared-types

# What happens:
# 1. Bun filters workspace → only @ui-designer/shared-types
# 2. Bun runs the "dev" script → turbo run dev
# 3. Turbo runs "dev" task in the filtered workspace
```
