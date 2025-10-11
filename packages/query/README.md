# @ui-designer/query

Runtime query helpers for TanStack Query, including query-key factories and query configuration. This package is separate from `@ui-designer/shared-types` to ensure type-only packages remain pure and don't contribute to runtime bundle size.

## Installation

```bash
bun add @ui-designer/query
```

## Usage

```ts
import { queryKeys } from '@ui-designer/query';
import { useQuery } from '@tanstack/react-query';

function ProjectList() {
  const { data } = useQuery({ queryKey: queryKeys.projects.list({ page: 1 }) });
  // ...
}
```

This package exposes runtime helpers only. For types, import from `@ui-designer/shared-types`.
