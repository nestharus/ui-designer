# API Patterns Guide

## Overview

This guide documents the preferred patterns for API interactions in the UI Designer project, leveraging TanStack Query v5's built-in capabilities and TypeScript's type system.

## Tech Stack Integration

- **TanStack Query v5**: Primary data fetching and caching layer
- **TypeScript 5.9**: Type safety and inference
- **Next.js 15**: App Router with Server Components
- **React 19**: UI framework

## Core Principles

1. **Leverage TanStack Query's built-in types** instead of custom wrappers
2. **Use discriminated unions** for type-safe state handling
3. **Prefer type inference** over explicit generics
4. **Register global types** for consistency across the app

---

## Recommended Patterns

### 1. Query Definitions with `queryOptions()`

**✅ Preferred Pattern:**

```typescript
import { queryOptions } from '@tanstack/react-query'
import { ErrorCode, type AppError, type Project } from '@ui-designer/shared-types'

// Define query options for reusability and type inference
export function projectQueryOptions(projectId: string) {
  return queryOptions({
    queryKey: ['projects', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}`)
      if (!response.ok) {
        const error: AppError = {
          code: response.status === 404 ? ErrorCode.RESOURCE_NOT_FOUND : ErrorCode.INTERNAL_ERROR,
          message: `Failed to fetch project: ${response.statusText}`,
          statusCode: response.status,
        }
        throw error
      }
      return response.json() as Promise<Project>
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Usage in components
function ProjectView({ projectId }: { projectId: string }) {
  const { data, isLoading, error } = useQuery(projectQueryOptions(projectId))

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  // data is automatically typed as Project
  return <div>{data.name}</div>
}

// Usage in prefetching
async function prefetchProject(projectId: string) {
  await queryClient.prefetchQuery(projectQueryOptions(projectId))
}

// Type-safe cache access
const project = queryClient.getQueryData(projectQueryOptions(projectId).queryKey)
// project is typed as Project | undefined
```

**❌ Avoid:**

```typescript
// Don't wrap TanStack Query's response in custom Result types
type ApiResult<T> = Result<ApiSuccess<T>, ApiFailure>;

// Don't create custom response wrappers
interface ApiResponse<T> {
  status: 'success' | 'failure';
  data?: T;
}
```

---

### 2. Error Handling

**✅ Preferred Pattern:**

Register a global error type and use TanStack Query's built-in error handling:

```typescript
// In a global types file (e.g., packages/shared-types/src/query-config.ts)
import '@tanstack/react-query'

export interface AppError {
  code: ErrorCode
  message: string
  details?: Record<string, unknown>
  statusCode?: number
}

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: AppError
  }
}

// In your query functions
export function projectQueryOptions(projectId: string) {
  return queryOptions({
    queryKey: ['projects', projectId],
    queryFn: async (): Promise<Project> => {
      const response = await fetch(`/api/projects/${projectId}`)

      if (!response.ok) {
        const error: AppError = {
          code: response.status === 404 ? ErrorCode.RESOURCE_NOT_FOUND : ErrorCode.INTERNAL_ERROR,
          message: `Failed to fetch project: ${response.statusText}`,
          statusCode: response.status,
        }
        throw error
      }

      return response.json()
    },
  })
}

// In components - error is automatically typed as AppError
function ProjectView({ projectId }: { projectId: string }) {
  const { data, error } = useQuery(projectQueryOptions(projectId))

  if (error) {
    // error is typed as AppError
    return <div>Error {error.code}: {error.message}</div>
  }

  return <div>{data.name}</div>
}
```

**Key Benefits:**

- No need for custom `Result<T, E>` types
- TanStack Query's discriminated unions (`isError`, `isSuccess`) provide type narrowing
- Errors are consistently typed across the entire app

---

### 3. Pagination

**✅ Preferred Pattern:**

Use TanStack Query's built-in pagination support:

```typescript
import { keepPreviousData, queryOptions } from '@tanstack/react-query'
import { ErrorCode, type AppError, type Paginated, type Project } from '@ui-designer/shared-types'

interface ProjectListParams {
  page: number
  pageSize: number
  search?: string
  filters?: Record<string, unknown>
}

export function projectListQueryOptions(params: ProjectListParams) {
  return queryOptions({
    queryKey: ['projects', 'list', params],
    queryFn: async (): Promise<Paginated<Project>> => {
      const searchParams = new URLSearchParams({
        page: params.page.toString(),
        pageSize: params.pageSize.toString(),
        ...(params.search && { search: params.search }),
      })

      const response = await fetch(`/api/projects?${searchParams}`)
      if (!response.ok) {
        const error: AppError = {
          code: ErrorCode.INTERNAL_ERROR,
          message: 'Failed to fetch projects',
          statusCode: response.status,
        }
        throw error
      }

      return response.json()
    },
    placeholderData: keepPreviousData, // Keep previous data while fetching new page
  })
}

// Usage
function ProjectList() {
  const [page, setPage] = useState(1)
  const { data, isLoading, isPlaceholderData } = useQuery(
    projectListQueryOptions({ page, pageSize: 20 })
  )

  return (
    <div>
      {data?.items.map(project => <ProjectCard key={project.id} project={project} />)}
      <Pagination
        page={page}
        total={data?.total ?? 0}
        onPageChange={setPage}
        disabled={isPlaceholderData}
      />
    </div>
  )
}
```

---

### 4. Infinite Scroll

**✅ Preferred Pattern:**

Use `useInfiniteQuery` with `infiniteQueryOptions()`:

```typescript
import { infiniteQueryOptions } from '@tanstack/react-query'
import { ErrorCode, type AppError, type Paginated, type Project } from '@ui-designer/shared-types'

export function infiniteProjectsQueryOptions(pageSize: number = 20) {
  return infiniteQueryOptions({
    queryKey: ['projects', 'infinite'],
    queryFn: async ({ pageParam }): Promise<Paginated<Project>> => {
      const response = await fetch(
        `/api/projects?page=${pageParam}&pageSize=${pageSize}`
      )
      if (!response.ok) {
        const error: AppError = {
          code: ErrorCode.INTERNAL_ERROR,
          message: 'Failed to fetch projects',
          statusCode: response.status,
        }
        throw error
      }
      return response.json()
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const hasMore = lastPage.page * lastPage.pageSize < lastPage.total
      return hasMore ? lastPage.page + 1 : undefined
    },
  })
}

// Usage
function InfiniteProjectList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(infiniteProjectsQueryOptions())

  return (
    <div>
      {data?.pages.map((page) =>
        page.items.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))
      )}
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  )
}
```

---

### 5. Mutations

**✅ Preferred Pattern:**

Use `mutationOptions()` for type-safe mutations:

```typescript
import { mutationOptions } from '@tanstack/react-query'
import type { CreatePayload, UpdatePayload, Project } from '@ui-designer/shared-types'

export function createProjectMutationOptions() {
  return mutationOptions({
    mutationFn: async (data: CreatePayload<Project>) => {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error: AppError = await response.json()
        throw error
      }

      return response.json() as Promise<Project>
    },
  })
}

export function updateProjectMutationOptions() {
  return mutationOptions({
    mutationFn: async (data: UpdatePayload<Project>) => {
      const response = await fetch(`/api/projects/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw await response.json()
      return response.json() as Promise<Project>
    },
  })
}

// Usage
function CreateProjectForm() {
  const queryClient = useQueryClient()

  const createProject = useMutation({
    ...createProjectMutationOptions(),
    onSuccess: (newProject) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['projects', 'list'] })

      // Or optimistically update cache
      queryClient.setQueryData(
        projectQueryOptions(newProject.id).queryKey,
        newProject
      )
    },
  })

  const handleSubmit = (data: CreatePayload<Project>) => {
    createProject.mutate(data)
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      {createProject.error && (
        <div>Error: {createProject.error.message}</div>
      )}
    </form>
  )
}
```

---

### 6. Query Key Management

**✅ Preferred Pattern:**

Create query key factories for consistency:

```typescript
// packages/shared-types/src/query-keys.ts
export const queryKeys = {
  projects: {
    all: ['projects'] as const,
    lists: () => [...queryKeys.projects.all, 'list'] as const,
    list: (params: ProjectListParams) => [...queryKeys.projects.lists(), params] as const,
    details: () => [...queryKeys.projects.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.projects.details(), id] as const,
  },
  agents: {
    all: ['agents'] as const,
    lists: () => [...queryKeys.agents.all, 'list'] as const,
    list: (filters: AgentFilters) => [...queryKeys.agents.lists(), filters] as const,
    details: () => [...queryKeys.agents.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.agents.details(), id] as const,
  },
} as const;

// Usage in query options
export function projectQueryOptions(projectId: string) {
  return queryOptions({
    queryKey: queryKeys.projects.detail(projectId),
    queryFn: async () => {
      // fetch logic
    },
  });
}

// Invalidation becomes type-safe
queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
```

---

### 7. Type-Safe Query Keys (Advanced)

**✅ Preferred Pattern:**

Register query key types for additional type safety:

```typescript
// In query-config.ts
import '@tanstack/react-query';

type ProjectQueryKey =
  | ['projects']
  | ['projects', 'list', ProjectListParams]
  | ['projects', 'detail', string];

type AgentQueryKey = ['agents'] | ['agents', 'list', AgentFilters] | ['agents', 'detail', string];

type AppQueryKey = ProjectQueryKey | AgentQueryKey;

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: AppError;
    queryKey: AppQueryKey;
  }
}
```

---

## Best Practices

### 1. Co-locate Query Options

Place query options near the components that use them or in a dedicated `queries/` directory:

```plaintext
src/
  features/
    projects/
      components/
        ProjectList.tsx
        ProjectDetail.tsx
      queries/
        project-queries.ts  ← Query options here
      types/
        project-types.ts
```

### 2. Use Query Options for Prefetching

```typescript
// In Server Components (Next.js 15)
export default async function ProjectPage({ params }: { params: { id: string } }) {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery(projectQueryOptions(params.id))

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProjectView projectId={params.id} />
    </HydrationBoundary>
  )
}
```

### 3. Handle Loading and Error States

```typescript
function ProjectView({ projectId }: { projectId: string }) {
  const { data, isLoading, error, isError } = useQuery(
    projectQueryOptions(projectId)
  )

  if (isLoading) return <ProjectSkeleton />
  if (isError) return <ErrorDisplay error={error} />

  // data is guaranteed to be defined here due to type narrowing
  return <ProjectDetails project={data} />
}
```

### 4. Optimistic Updates

```typescript
const updateProject = useMutation({
  ...updateProjectMutationOptions(),
  onMutate: async (updatedProject) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({
      queryKey: queryKeys.projects.detail(updatedProject.id),
    });

    // Snapshot previous value
    const previous = queryClient.getQueryData(queryKeys.projects.detail(updatedProject.id));

    // Optimistically update
    queryClient.setQueryData(queryKeys.projects.detail(updatedProject.id), updatedProject);

    return { previous };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    if (context?.previous) {
      queryClient.setQueryData(queryKeys.projects.detail(variables.id), context.previous);
    }
  },
  onSettled: (data, error, variables) => {
    // Refetch after mutation
    queryClient.invalidateQueries({
      queryKey: queryKeys.projects.detail(variables.id),
    });
  },
});
```

---

## Summary

### ✅ Use TanStack Query's Built-in Features

- `queryOptions()` for type-safe, reusable query definitions
- `infiniteQueryOptions()` for infinite scroll
- `mutationOptions()` for type-safe mutations
- Built-in discriminated unions (`isLoading`, `isError`, `isSuccess`)
- `keepPreviousData` for smooth pagination
- Module augmentation for global error types

### ❌ Avoid Custom Wrappers

- Don't wrap responses in custom `Result<T, E>` types
- Don't create custom `ApiResponse` wrappers
- Don't use custom `ApiRequest` types
- Let TanStack Query handle state management

### 🎯 Benefits

1. **Better Type Inference**: TypeScript can infer types automatically
2. **Less Boilerplate**: No need to unwrap custom response types
3. **Consistency**: Everyone uses the same patterns
4. **Better DX**: IDE autocomplete works better with native types
5. **Future-Proof**: Aligned with TanStack Query's evolution

---

## Additional Resources

- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [TypeScript Guide](https://tanstack.com/query/latest/docs/framework/react/typescript)
- [Query Options API](https://tanstack.com/query/latest/docs/framework/react/reference/queryOptions)
- [Community Best Practices](https://tkdodo.eu/blog/react-query-and-type-script)
