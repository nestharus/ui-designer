# Command Execution Flow

## How `bun run --filter` Works

This document explains the execution flow when you run workspace-filtered commands in this monorepo.

## Execution Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ Developer runs:                                                 │
│ $ bun run dev --filter @ui-designer/shared-types                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 1: Bun Workspace Filtering                                 │
│ ─────────────────────────────────────────────────────────────── │
│ • Bun reads workspaces from package.json                        │
│ • Filters to: @ui-designer/shared-types                         │
│ • Sets working directory context                                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 2: Script Lookup                                           │
│ ─────────────────────────────────────────────────────────────── │
│ • Bun looks up "dev" in root package.json                       │
│ • Finds: "dev": "turbo run dev"                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 3: Execute Turbo (via node_modules/.bin/)                  │
│ ─────────────────────────────────────────────────────────────── │
│ • Bun executes: turbo run dev                                   │
│ • Turbo runs in the filtered workspace context                  │
│ • Turbo applies its caching and task orchestration              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 4: Task Execution                                          │
│ ─────────────────────────────────────────────────────────────── │
│ • Turbo runs "dev" task in @ui-designer/shared-types            │
│ • Output: Only the filtered package runs                        │
└─────────────────────────────────────────────────────────────────┘
```

## Why This Architecture?

### 1. Bun-First Philosophy

From `AGENTS.md`:

> Always prefer `bun run`/`bunx` when executing scripts; `npm`, `pnpm`, and `node` CLIs are not part of this workflow.

This means:

- ✅ All commands start with `bun run`
- ✅ Bun manages workspace filtering
- ✅ Turbo is invoked internally, not directly

### 2. Separation of Concerns

```
┌──────────────┐         ┌──────────────┐
│     Bun      │         │    Turbo     │
│              │         │              │
│  Workspace   │────────▶│   Caching    │
│  Filtering   │         │   Pipeline   │
│              │         │   Execution  │
└──────────────┘         └──────────────┘
```

- **Bun** handles: Workspace management, filtering, script execution
- **Turbo** handles: Task caching, dependency graphs, parallel execution

### 3. No Global Turbo CLI

The `turbo` command is **not** in your PATH. This is intentional:

```bash
# ❌ This will fail
$ turbo run dev
turbo: command not found

# ✅ This works - Bun runs local turbo
$ bun run dev
```

## Comparison: What Doesn't Work

### ❌ Direct Turbo Invocation

```bash
# This fails because turbo is not in PATH
turbo run dev --filter=@ui-designer/shared-types
```

**Error:**

```
turbo: command not found
```

### ❌ Using Turbo's Filter Syntax with Bun

```bash
# This doesn't work - wrong syntax
bun run dev --filter=@ui-designer/shared-types
```

**Problem:** Bun's `--filter` flag uses space-separated syntax, not `=` syntax.

### ✅ Correct Approach

```bash
# This works - Bun's syntax
bun run dev --filter @ui-designer/shared-types
```

## Alternative: Using bunx

If you need to invoke Turbo directly (not recommended for daily use):

```bash
# This works but is verbose
bunx turbo run dev --filter=@ui-designer/shared-types
```

**Execution flow:**

```
bunx → Finds local turbo → Runs with Turbo's --filter= syntax
```

**Why not recommended:**

- Verbose (extra `bunx` prefix)
- Different syntax (`--filter=` vs `--filter`)
- Bypasses Bun's workspace features
- Inconsistent with project conventions

## Verification Commands

### Verify Bun Filtering Works

```bash
$ bun run build --filter @ui-designer/shared-types

# Expected output:
• Packages in scope: @ui-designer/shared-types
• Running build in 1 packages
```

### Verify Turbo Is Not in PATH

```bash
$ turbo --version

# Expected output:
turbo: command not found
```

### Verify Local Turbo Exists

```bash
$ bunx turbo --version

# Expected output:
2.5.8 (or current version)
```

## Summary

| Command                                            | Works? | Recommended? | Why?                                    |
| -------------------------------------------------- | ------ | ------------ | --------------------------------------- |
| `bun run dev --filter @ui-designer/pkg`            | ✅ Yes | ✅ Yes       | Bun-first, correct syntax               |
| `turbo run dev --filter=@ui-designer/pkg`          | ❌ No  | ❌ No        | Turbo not in PATH                       |
| `bunx turbo run dev --filter=@ui-designer/pkg`     | ✅ Yes | ⚠️ Verbose   | Works but inconsistent with conventions |
| `bun run dev --filter=@ui-designer/pkg` (with `=`) | ❌ No  | ❌ No        | Wrong syntax for Bun                    |

**Golden Rule:** Always use `bun run <script> --filter <package>` for workspace filtering.
