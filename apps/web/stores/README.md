# Zustand Stores

This directory contains Zustand stores for managing shared UI state across client components.

## What Goes Here

**Only ephemeral, client-side UI state that needs to be shared across multiple components.**

Examples:

- Modal/drawer open/closed states
- Sidebar collapsed/expanded
- Selected items in a table
- Active filters in a dashboard
- Multi-step wizard progress
- Toast notifications
- Theme preferences (before persisting)

## What Does NOT Go Here

❌ **Server data** - Use TanStack Query for that
❌ **Form state** - Use `useState` or form libraries
❌ **Auth tokens** - Store in HttpOnly cookies on the server
❌ **Single-component state** - Use `useState` in the component

## Store Structure

Each store should:

1. Have a clear, focused purpose
2. Include TypeScript interfaces
3. Document its purpose with JSDoc comments
4. Export a single hook (e.g., `useUIStore`)

## Example Store

```typescript
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

## Usage

```typescript
'use client';

import { useUIStore } from '@/stores/ui';

export function Sidebar() {
  // ✅ Good: Use selector for performance
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  return (
    <aside className={sidebarOpen ? 'w-64' : 'w-0'}>
      <button onClick={toggleSidebar}>Toggle</button>
    </aside>
  );
}
```

## Best Practices

1. **Keep stores small and focused** - One store per domain
2. **Use selectors** - Prevent unnecessary re-renders
3. **Don't duplicate server state** - Use TanStack Query for that
4. **Type everything** - Always provide TypeScript interfaces
5. **Document purpose** - Add JSDoc comments explaining when to use

## See Also

- [State Management Guide](../../docs/state-management-guide.md) - Complete guide on when to use what
- [Zustand Documentation](https://docs.pmnd.rs/zustand/getting-started/introduction)
