# State Management Guide

This guide explains when and how to use different state management solutions in the UI Designer project.

## Overview

The project uses a layered approach to state management, with each tool serving a specific purpose:

| Tool                          | Purpose               | Use When                                                         |
| ----------------------------- | --------------------- | ---------------------------------------------------------------- |
| `useState` / `useReducer`     | Local component state | State is only needed within a single component                   |
| Zustand                       | Shared UI state       | Multiple client components need to read/write ephemeral UI state |
| TanStack Query                | Remote data cache     | Fetching, caching, and synchronizing server data on the client   |
| React Server Components (RSC) | Initial server data   | SEO-critical data, initial page loads, streaming UI              |
| Server Actions                | Server mutations      | Form submissions, data mutations that update server state        |

## Decision Tree

```text
Does the state need to persist across page reloads?
├─ Yes → Use cookies/localStorage + hydrate into appropriate store
└─ No → Continue...

Is this data authoritative on the server (shared across users/devices)?
├─ Yes → Use RSC for reads, Server Actions for writes
│         (optionally cache on client with TanStack Query)
└─ No → Continue...

Does the state need to be shared across multiple components?
├─ Yes → Use Zustand
└─ No → Use useState/useReducer
```

## 1. Local Component State: `useState` / `useReducer`

**Use for:** State that only matters within a single component.

### Examples

- Form input values (uncontrolled)
- Toggle states (expand/collapse)
- Local loading states
- Focused element tracking
- Temporary UI calculations

### Pattern

```typescript
'use client';

import { useState } from 'react';

export function SearchInput() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    />
  );
}
```

### When to use `useReducer`

Use `useReducer` when:

- State updates are complex (multiple related values)
- Next state depends on previous state
- You want to separate state logic from component

```typescript
type State = { count: number; step: number };
type Action = { type: 'increment' } | { type: 'decrement' } | { type: 'setStep'; step: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + state.step };
    case 'decrement':
      return { ...state, count: state.count - state.step };
    case 'setStep':
      return { ...state, step: action.step };
  }
}

export function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0, step: 1 });
  // ...
}
```

## 2. Shared UI State: Zustand

**Use for:** Ephemeral UI state that needs to be shared across multiple client components.

### Examples

- Modal/drawer open/closed state
- Multi-step wizard progress
- Selected rows in a table
- Active filters in a dashboard
- Drag-and-drop state
- Toast notifications
- Theme preferences (before persisting)
- Sidebar collapsed/expanded state

### Setup

Create stores in `apps/web/stores/`:

```typescript
// apps/web/stores/ui.ts
import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
```

### Usage

```typescript
'use client';

import { useUIStore } from '@/stores/ui';

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <aside className={sidebarOpen ? 'w-64' : 'w-0'}>
      <button onClick={toggleSidebar}>Toggle</button>
      {/* sidebar content */}
    </aside>
  );
}

export function Header() {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  return (
    <header>
      <button onClick={toggleSidebar}>☰</button>
    </header>
  );
}
```

### Performance: Selective Subscriptions

Use selectors to prevent unnecessary re-renders:

```typescript
// ❌ Bad: Re-renders on any store change
const store = useUIStore();

// ✅ Good: Only re-renders when sidebarOpen changes
const sidebarOpen = useUIStore((state) => state.sidebarOpen);

// ✅ Good: Only re-renders when toggleSidebar reference changes (never, in this case)
const toggleSidebar = useUIStore((state) => state.toggleSidebar);
```

### Zustand with Persistence

For state that should survive page reloads:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PreferencesState {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'user-preferences',
    }
  )
);
```

### Zustand Best Practices

1. **Keep stores small and focused** - One store per domain (UI, filters, etc.)
2. **Don't store server data** - Use TanStack Query for that
3. **Use selectors** - Prevent unnecessary re-renders
4. **Colocate actions** - Keep actions in the same store as the state
5. **Type everything** - Always provide TypeScript interfaces

## 3. Remote Data Cache: TanStack Query

**Use for:** Client-side fetching, caching, and synchronizing server data.

### Examples

- Paginated tables
- Infinite scroll lists
- Dashboard widgets with auto-refresh
- Search results
- Real-time data that polls
- Optimistic updates

### Setup

Query client is already configured in `apps/web/app/providers.tsx`.

### Basic Query

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';

async function fetchProjects() {
  const res = await fetch('/api/projects');
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export function ProjectsList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    staleTime: 60 * 1000, // Consider fresh for 1 minute
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data.map((project) => (
        <li key={project.id}>{project.name}</li>
      ))}
    </ul>
  );
}
```

### Mutations

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

async function createProject(data: { name: string }) {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create');
  return res.json();
}

export function CreateProjectForm() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      mutation.mutate({ name: formData.get('name') as string });
    }}>
      <input name="name" required />
      <button disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create'}
      </button>
    </form>
  );
}
```

### Optimistic Updates

```typescript
const mutation = useMutation({
  mutationFn: updateProject,
  onMutate: async (newProject) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['projects'] });

    // Snapshot previous value
    const previous = queryClient.getQueryData(['projects']);

    // Optimistically update
    queryClient.setQueryData(['projects'], (old: any[]) =>
      old.map((p) => (p.id === newProject.id ? newProject : p))
    );

    return { previous };
  },
  onError: (err, newProject, context) => {
    // Rollback on error
    queryClient.setQueryData(['projects'], context?.previous);
  },
  onSettled: () => {
    // Refetch after error or success
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  },
});
```

### Hydrating from RSC

```typescript
// app/projects/page.tsx (Server Component)
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/src/lib/query-client';
import { ProjectsList } from './projects-list';

async function fetchProjects() {
  const res = await fetch('http://localhost:8080/api/projects');
  return res.json();
}

export default async function ProjectsPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProjectsList />
    </HydrationBoundary>
  );
}
```

## 4. Server Components (RSC)

**Use for:** Initial data loading, SEO-critical content, streaming UI.

### Examples

- Blog post content
- Product listings
- User profiles
- Dashboard initial state
- Static content

### Pattern

```typescript
// app/projects/page.tsx (Server Component - default)
async function getProjects() {
  const res = await fetch('http://localhost:8080/api/projects', {
    next: { revalidate: 60 }, // Cache for 60 seconds
  });
  return res.json();
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div>
      <h1>Projects</h1>
      <ul>
        {projects.map((project) => (
          <li key={project.id}>{project.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### With Suspense Streaming

```typescript
import { Suspense } from 'react';

async function Projects() {
  const projects = await getProjects();
  return <ProjectsList projects={projects} />;
}

export default function ProjectsPage() {
  return (
    <div>
      <h1>Projects</h1>
      <Suspense fallback={<div>Loading projects...</div>}>
        <Projects />
      </Suspense>
    </div>
  );
}
```

## 5. Server Actions

**Use for:** Form submissions and server mutations.

### Examples

- Creating/updating/deleting resources
- Form validation
- File uploads
- Sending emails

### Pattern

```typescript
// app/actions.ts
'use server';

import { revalidateTag } from 'next/cache';

export async function createProject(formData: FormData) {
  const name = formData.get('name') as string;

  // Validate
  if (!name || name.length < 3) {
    return { error: 'Name must be at least 3 characters' };
  }

  // Call backend
  const res = await fetch('http://localhost:8080/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    return { error: 'Failed to create project' };
  }

  // Revalidate cached data
  revalidateTag('projects');

  return { success: true };
}
```

### Usage with `useActionState`

```typescript
'use client';

import { useActionState } from 'react';
import { createProject } from './actions';

export function CreateProjectForm() {
  const [state, formAction, isPending] = useActionState(createProject, null);

  return (
    <form action={formAction}>
      <input name="name" required />
      <button disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Project'}
      </button>
      {state?.error && <p className="text-red-500">{state.error}</p>}
      {state?.success && <p className="text-green-500">Created!</p>}
    </form>
  );
}
```

### Coordinating Server Actions with TanStack Query

```typescript
'use client';

import { useActionState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createProject } from './actions';

export function CreateProjectForm() {
  const queryClient = useQueryClient();
  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const result = await createProject(formData);

      if (result.success) {
        // Invalidate client cache
        await queryClient.invalidateQueries({ queryKey: ['projects'] });
      }

      return result;
    },
    null
  );

  return (
    <form action={formAction}>
      {/* form fields */}
    </form>
  );
}
```

## Authentication State

### Server-Side (Source of Truth)

Auth should be verified on the server using HttpOnly cookies or JWT:

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('session')?.value;

  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}
```

### Client-Side (UI Convenience)

Hydrate read-only auth state into Zustand for UI decisions:

```typescript
// stores/auth.ts
import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  user: { id: string; email: string; role: string } | null;
  setAuth: (user: AuthState['user']) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  setAuth: (user) => set({ isAuthenticated: true, user }),
  clearAuth: () => set({ isAuthenticated: false, user: null }),
}));
```

```typescript
// app/layout.tsx
import { cookies } from 'next/headers';
import { AuthProvider } from './auth-provider';

export default async function RootLayout({ children }) {
  const session = cookies().get('session');
  const user = session ? await verifySession(session.value) : null;

  return (
    <html>
      <body>
        <AuthProvider user={user}>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

```typescript
// app/auth-provider.tsx
'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';

export function AuthProvider({ user, children }) {
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    if (user) {
      setAuth(user);
    }
  }, [user, setAuth]);

  return <>{children}</>;
}
```

## Common Patterns

### Pattern 1: Filters + Data

Combine Zustand (filters) with TanStack Query (data):

```typescript
// stores/filters.ts
import { create } from 'zustand';

interface FiltersState {
  search: string;
  status: 'all' | 'active' | 'archived';
  setSearch: (search: string) => void;
  setStatus: (status: FiltersState['status']) => void;
}

export const useFilters = create<FiltersState>((set) => ({
  search: '',
  status: 'all',
  setSearch: (search) => set({ search }),
  setStatus: (status) => set({ status }),
}));
```

```typescript
// components/projects-table.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { useFilters } from '@/stores/filters';

export function ProjectsTable() {
  const { search, status } = useFilters();

  const { data } = useQuery({
    queryKey: ['projects', { search, status }],
    queryFn: () => fetchProjects({ search, status }),
  });

  return <table>{/* render data */}</table>;
}
```

### Pattern 2: Modal State

```typescript
// stores/modals.ts
import { create } from 'zustand';

interface ModalsState {
  createProjectOpen: boolean;
  editProjectId: string | null;
  openCreateProject: () => void;
  closeCreateProject: () => void;
  openEditProject: (id: string) => void;
  closeEditProject: () => void;
}

export const useModals = create<ModalsState>((set) => ({
  createProjectOpen: false,
  editProjectId: null,
  openCreateProject: () => set({ createProjectOpen: true }),
  closeCreateProject: () => set({ createProjectOpen: false }),
  openEditProject: (id) => set({ editProjectId: id }),
  closeEditProject: () => set({ editProjectId: null }),
}));
```

## Best Practices

### 1. Keep Zustand Stores Small

```typescript
// ❌ Bad: One giant store
const useStore = create((set) => ({
  user: null,
  projects: [],
  filters: {},
  modals: {},
  // ... too much
}));

// ✅ Good: Focused stores
const useAuthStore = create(/* auth only */);
const useFiltersStore = create(/* filters only */);
const useModalsStore = create(/* modals only */);
```

### 2. Don't Duplicate Server State

```typescript
// ❌ Bad: Storing server data in Zustand
const useStore = create((set) => ({
  projects: [],
  setProjects: (projects) => set({ projects }),
}));

// ✅ Good: Use TanStack Query for server data
const { data: projects } = useQuery({
  queryKey: ['projects'],
  queryFn: fetchProjects,
});
```

### 3. Use Selectors for Performance

```typescript
// ❌ Bad: Component re-renders on any store change
function Component() {
  const store = useStore();
  return <div>{store.count}</div>;
}

// ✅ Good: Only re-renders when count changes
function Component() {
  const count = useStore((state) => state.count);
  return <div>{count}</div>;
}
```

### 4. Coordinate Invalidations

After a Server Action, invalidate both server and client caches:

```typescript
'use server';

export async function updateProject(id: string, data: any) {
  await fetch(`http://localhost:8080/api/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  // Invalidate server cache
  revalidateTag('projects');
  revalidatePath('/projects');

  // Client will invalidate via useActionState callback
}
```

## Troubleshooting

### Issue: Zustand state not persisting

**Solution:** Use the `persist` middleware:

```typescript
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      /* state */
    }),
    { name: 'my-store' }
  )
);
```

### Issue: TanStack Query not refetching

**Solution:** Check `staleTime` and use `refetchInterval` for polling:

```typescript
useQuery({
  queryKey: ['projects'],
  queryFn: fetchProjects,
  staleTime: 0, // Always consider stale
  refetchInterval: 5000, // Poll every 5 seconds
});
```

### Issue: Server Action not updating UI

**Solution:** Ensure you're revalidating and invalidating:

```typescript
// Server Action
revalidateTag('projects');

// Client component
await queryClient.invalidateQueries({ queryKey: ['projects'] });
```

## Summary

| State Type          | Tool                  | Example                            |
| ------------------- | --------------------- | ---------------------------------- |
| Local UI            | `useState`            | Input value, local toggle          |
| Shared UI           | Zustand               | Sidebar open, modal state, filters |
| Server Data (read)  | RSC or TanStack Query | Projects list, user profile        |
| Server Data (write) | Server Actions        | Create project, update user        |
| Auth (truth)        | Server (cookies/JWT)  | Session verification               |
| Auth (UI)           | Zustand (hydrated)    | Show/hide based on role            |

**Golden Rule:** If it's authoritative on the server, don't own it in Zustand. Read via RSC/Query, write via Server Actions.
