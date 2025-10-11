# TanStack Query Module Augmentation Migration

## Problem

The `@ui-designer/shared-types` package previously included module augmentation for `@tanstack/react-query`, which caused build failures due to:

1. **Bun's symlinked package structure** - Bun creates symlinks in `node_modules/.bun/` that TypeScript traverses
2. **Strict TypeScript settings** - Our `exactOptionalPropertyTypes: true` and `noImplicitOverride: true` are incompatible with TanStack Query's internal code
3. **Type-checking library code** - TypeScript was checking TanStack Query's source, not just using its type definitions

## Solution

**Removed module augmentation from `shared-types`** and moved it to consuming apps.

## Migration Steps

### For Apps Using TanStack Query

Add module augmentation in your app's query client setup:

```typescript
// app/lib/query-client.ts (or similar)
import { QueryClient } from '@tanstack/react-query';
import type { AppError } from '@ui-designer/shared-types';

// Module augmentation - must be in a file that imports @tanstack/react-query
declare module '@tanstack/react-query' {
  interface Register {
    defaultError: AppError;
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // error is now typed as AppError
        if (error.code === 'AUTHENTICATION_FAILED') return false;
        return failureCount < 3;
      },
    },
  },
});
```

### Benefits

- ✅ `turbo run build` works
- ✅ `turbo run type-check` works
- ✅ No node_modules pollution in type-checking
- ✅ Clean separation of concerns
- ✅ Apps control their own TanStack Query configuration

## Technical Details

### Why This Happened

When `shared-types` had:

```typescript
import '@tanstack/react-query';

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: AppError;
  }
}
```

TypeScript would:

1. Resolve `@tanstack/react-query` through Bun's symlinks
2. Find source files in `node_modules/.bun/@tanstack+query-core@5.90.2/`
3. Type-check those files against our strict settings
4. Fail with 100+ errors about `window` not found, missing `override` modifiers, etc.

### Why skipLibCheck Didn't Help

`skipLibCheck: true` only skips `.d.ts` files. When TypeScript resolves through Bun's symlinks, it finds `.ts` source files, which are still checked.

### The Correct Pattern

- **Shared types packages**: Export types only, no module augmentation
- **Consuming apps**: Perform module augmentation where they use the library
- **Type safety**: Maintained through proper exports and imports

## Related Issues

- Bun issue: https://github.com/oven-sh/bun/issues/...
- TypeScript exactOptionalPropertyTypes: https://www.typescriptlang.org/tsconfig#exactOptionalPropertyTypes
