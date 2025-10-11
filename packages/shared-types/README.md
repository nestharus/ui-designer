# @ui-designer/shared-types

Shared TypeScript type definitions for cross-service contracts within the UI Designer monorepo.

## Purpose

Provide a single source of truth for API contracts, domain models, and shared utility types so that frontend apps, backend services, and agents remain aligned as the platform evolves.

## Building

This package must be built before other workspace packages can consume its types. After cloning the repository or when making changes to type definitions, run:

```sh
# From repository root
bun run setup

# Or directly in this package
cd packages/shared-types
bun run build
```

The build output is generated in the `dist/` directory and is referenced by other packages via TypeScript project references.

## Usage

```ts
import { queryOptions, useQuery } from '@tanstack/react-query';
import {
  ErrorCode,
  queryKeys,
  type AppError,
  type Project,
} from '@ui-designer/shared-types';

const projectQuery = queryOptions({
  queryKey: queryKeys.projects.detail('abc'),
  queryFn: async (): Promise<Project> => {
    const response = await fetch('/api/projects/abc');
    if (!response.ok) {
      const error: AppError = {
        code: response.status === 404 ? ErrorCode.RESOURCE_NOT_FOUND : ErrorCode.INTERNAL_ERROR,
        message: 'Failed to fetch project',
        statusCode: response.status,
      };
      throw error;
    }
    return response.json() as Promise<Project>;
  },
});

function ProjectView() {
  const { data, error, isLoading } = useQuery(projectQuery);
  if (isLoading) return <span>Loading...</span>;
  if (error) return <span>Error: {error.message}</span>;
  return <span>{data.name}</span>;
}
```

## Structure

- `common.ts` – Utility helpers and primitives (`ErrorCode`, `Paginated`, literal enums)
- `query-config.ts` – Defines `AppError` type for TanStack Query error handling
- `query-keys.ts` – Query key factories for consistent cache scoping
- `domain.ts` – Core business entities (projects, design tokens, agents, prototypes)
- `index.ts` – Barrel export exposing the public API surface

## TanStack Query Integration

This package exports an `AppError` type designed for TanStack Query. **Apps must perform their own module augmentation**:

```typescript
// In your app's setup file (e.g., app/lib/query-client.ts)
import type { AppError } from '@ui-designer/shared-types';
import '@tanstack/react-query';

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: AppError;
  }
}
```

**Why not augment in this package?**

Module augmentation in shared-types would cause TypeScript to traverse into `node_modules`, which breaks with Bun's symlinked package structure and strict compiler settings (`exactOptionalPropertyTypes`, `noImplicitOverride`). Keeping this package dependency-free ensures clean builds and type-checking.

## Guidelines

- Prefer `readonly` fields and immutable data structures
- Avoid using `any`; leverage generics or discriminated unions for polymorphism
- Document complex types with JSDoc comments for future contributors
- Align enum and literal values with Living Specification terminology
- Review [`docs/api-patterns-guide.md`](../../docs/api-patterns-guide.md) for end-to-end examples that combine these exports with TanStack Query

## Adding New Types

1. Define new shapes within the appropriate file or create a dedicated module under `src/`
2. Export them through `index.ts` so consumers can import from the package root
3. Update any affected tests or consumers to adopt the new contracts
4. Keep the package version aligned with the monorepo release cadence
