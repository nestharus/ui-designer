# Architecture Overview

This document provides a high-level overview of the UI Designer project architecture.

## Tech Stack

### Frontend Framework

- **Next.js 15** - React framework with App Router
- **React 19** - UI library with Server Components
- **TypeScript 5.9** - Type safety

### State Management

- **useState/useReducer** - Local component state
- **Zustand** - Shared UI state across client components
- **TanStack Query** - Remote data caching and synchronization
- **React Server Components** - Initial server data loading
- **Server Actions** - Server-side mutations

### Styling

- **Tailwind CSS v4** - Utility-first CSS (primary)
- **Emotion** - CSS-in-JS for dynamic styles (client components only)
- **CSS Modules** - Traditional CSS with scoping (optional)

### Data Fetching

- **TanStack Query** - Client-side data fetching and caching
- **Server Components** - Server-side data fetching
- **Server Actions** - Form submissions and mutations

### Backend Integration

- **Vert.x** - Java backend (REST API)
- **Next.js as BFF** - Backend-for-Frontend layer

## Architecture Layers

```text
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Client Components (React 19)                          │ │
│  │  - useState/useReducer (local state)                   │ │
│  │  - Zustand (shared UI state)                           │ │
│  │  - TanStack Query (remote data cache)                  │ │
│  │  - Emotion (dynamic styles)                            │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 15 (BFF)                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Server Components (React 19)                          │ │
│  │  - Initial data loading                                │ │
│  │  - SEO-critical content                                │ │
│  │  - Streaming UI                                        │ │
│  │  - Tailwind CSS (static styles)                        │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Server Actions                                        │ │
│  │  - Form submissions                                    │ │
│  │  - Data mutations                                      │ │
│  │  - Auth verification                                   │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Route Handlers (API Routes)                           │ │
│  │  - REST endpoints for client                           │ │
│  │  - Proxy to Vert.x                                     │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                      Vert.x Backend                          │
│  - REST API                                                  │
│  - Business logic                                            │
│  - Database access                                           │
└─────────────────────────────────────────────────────────────┘
```

## State Management Decision Tree

```text
┌─────────────────────────────────────────────────────────┐
│ What kind of state do you need?                        │
└─────────────────────────────────────────────────────────┘
                        ↓
        ┌───────────────┴───────────────┐
        │                               │
    Server Data                    UI State
        │                               │
        ↓                               ↓
┌───────────────┐              ┌────────────────┐
│ Initial Load? │              │ Single Comp?   │
└───────────────┘              └────────────────┘
    │       │                      │        │
   Yes      No                    Yes       No
    │       │                      │        │
    ↓       ↓                      ↓        ↓
  RSC   TanStack              useState   Zustand
        Query
```

## Styling Decision Tree

```text
┌─────────────────────────────────────────────────────────┐
│ What component type?                                    │
└─────────────────────────────────────────────────────────┘
                        ↓
        ┌───────────────┴───────────────┐
        │                               │
  Server Component              Client Component
        │                               │
        ↓                               ↓
   Tailwind CSS                ┌────────────────┐
                               │ Dynamic styles?│
                               └────────────────┘
                                   │        │
                                  Yes       No
                                   │        │
                                   ↓        ↓
                                Emotion  Tailwind
```

## Data Flow Patterns

### Pattern 1: Server-First (Recommended)

```text
User Request
    ↓
Server Component (RSC)
    ↓
Fetch from Vert.x
    ↓
Stream HTML to Browser
    ↓
Hydrate Client Components
    ↓
TanStack Query (optional, for live updates)
```

### Pattern 2: Client-Side Data

```text
User Interaction
    ↓
Client Component
    ↓
TanStack Query
    ↓
Fetch from Next.js API Route
    ↓
Proxy to Vert.x
    ↓
Return Data
    ↓
Update UI
```

### Pattern 3: Mutations

```text
User Submits Form
    ↓
Server Action
    ↓
Validate & Call Vert.x
    ↓
Revalidate Server Cache (revalidateTag)
    ↓
Invalidate Client Cache (queryClient.invalidateQueries)
    ↓
UI Updates
```

## Directory Structure

```text
apps/web/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout (Server Component)
│   ├── page.tsx           # Home page (Server Component)
│   ├── providers.tsx      # Client providers (TanStack Query)
│   └── emotion-registry.tsx # Emotion setup
├── features/              # Feature-first UI and logic (UI co-located per feature)
│   └── home/              # Home feature (page, components, tests)
├── store/                 # Zustand stores (global client state)
│   ├── ui.ts              # UI state
│   ├── auth.ts            # Auth UI state
│   └── README.md          # Store documentation
├── lib/                   # Framework-agnostic utilities
│   ├── query-client.ts    # TanStack Query client
│   └── highlight.ts       # Syntax highlighting utils
├── hooks/                 # App-wide reusable hooks
├── server/                # Server-only code (actions, data, services)
│   ├── actions/           # Server Actions live here (not under app/)
│   ├── data/
│   └── services/
├── styles/                # Global styles
│   └── globals.css        # Tailwind + custom CSS
└── tests/                 # Cross-cutting integration tests and fixtures
    ├── integration/
    └── fixtures/

docs/                      # Documentation
├── state-management-guide.md   # State management patterns
├── styling-guide.md           # Styling patterns
└── architecture-overview.md   # This file

packages/
├── shared-types/          # Shared TypeScript types (types-only)
└── query/                 # Runtime query helpers (query keys, config)
```

Note: Avoid a monolithic `components/` folder. Prefer feature-first organization under `features/` so UI, hooks, and tests for a feature live together.

## Key Principles

### 1. Server-First

- Default to Server Components
- Use Client Components only when needed (interactivity, browser APIs)
- Keep client bundles small

### 2. Layered State

- Local state: `useState`
- Shared UI state: Zustand
- Server data: RSC + TanStack Query
- Never duplicate server data in Zustand

### 3. Progressive Enhancement

- Forms work without JavaScript (Server Actions)
- Enhance with client-side validation and optimistic updates
- Graceful degradation

### 4. Type Safety

- TypeScript everywhere
- Shared types between frontend and backend
- Zod for runtime validation

### 5. Performance

- Server Components for initial load
- Streaming for faster TTFB
- Code splitting with dynamic imports
- Optimistic updates for perceived performance

## Authentication Flow

```text
1. User logs in
   ↓
2. Server Action validates credentials
   ↓
3. Call Vert.x auth endpoint
   ↓
4. Set HttpOnly cookie (session/JWT)
   ↓
5. Redirect to dashboard
   ↓
6. Server Component reads cookie
   ↓
7. Hydrate auth UI state into Zustand
   ↓
8. Client components use Zustand for UI decisions
```

**Important:**

- Source of truth: Server (cookies/JWT)
- Zustand: Read-only UI convenience
- Never store tokens in JavaScript state

## Common Patterns

### Pattern: Dashboard with Filters

```typescript
// Server Component (initial load)
export default async function DashboardPage() {
  const initialData = await fetchProjects();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardClient initialData={initialData} />
    </HydrationBoundary>
  );
}

// Client Component (filters + live updates)
'use client';

export function DashboardClient({ initialData }) {
  const { search, status } = useFilters(); // Zustand

  const { data } = useQuery({
    queryKey: ['projects', { search, status }],
    queryFn: () => fetchProjects({ search, status }),
    initialData,
  });

  return <ProjectsTable data={data} />;
}
```

### Pattern: Form with Optimistic Update

```typescript
'use client';

export function CreateProjectForm() {
  const queryClient = useQueryClient();
  const [state, formAction, isPending] = useActionState(
    async (prevState, formData) => {
      // Optimistic update
      queryClient.setQueryData(['projects'], (old) => [
        ...old,
        { id: 'temp', name: formData.get('name') }
      ]);

      // Server Action
      const result = await createProject(formData);

      // Invalidate on success
      if (result.success) {
        await queryClient.invalidateQueries({ queryKey: ['projects'] });
      }

      return result;
    },
    null
  );

  return <form action={formAction}>{/* fields */}</form>;
}
```

## See Also

- [State Management Guide](./state-management-guide.md) - Detailed state management patterns
- [Styling Guide](./styling-guide.md) - Styling best practices
- [Testing Guide](./testing-guide.md) - Testing strategies
- [API Patterns Guide](./api-patterns-guide.md) - API design patterns
