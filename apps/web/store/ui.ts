/// <reference lib="dom" />
import { create } from 'zustand';

/**
 * UI Store - Manages ephemeral UI state across client components
 *
 * Examples: sidebar open/closed, modal states, drawer visibility
 *
 * @see docs/state-management-guide.md for when to use this vs other state solutions
 */
interface UIState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

function getStorage(): Storage | null {
  const g: unknown = globalThis;
  if (typeof g === 'object' && g !== null && 'localStorage' in g) {
    return (g as { localStorage: Storage }).localStorage;
  }
  return null;
}

// Returns true by default when localStorage key is absent, matching INITIAL_SIDEBAR_OPEN
function readSidebarOpen(): boolean {
  const storage = getStorage();
  const raw = storage?.getItem('sidebarOpen');
  if (raw === 'true') return true;
  return raw !== 'false';
}

function writeSidebarOpen(value: boolean): void {
  const storage = getStorage();
  storage?.setItem('sidebarOpen', value ? 'true' : 'false');
}

const INITIAL_SIDEBAR_OPEN = true;

export const useUIStore = create<UIState>((set) => ({
  // Use a consistent SSR-friendly default; rehydrate on the client after hydration
  sidebarOpen: INITIAL_SIDEBAR_OPEN,
  setSidebarOpen: (open) => {
    set({ sidebarOpen: open });
    writeSidebarOpen(open);
  },
  toggleSidebar: () => {
    set((state) => {
      const next = !state.sidebarOpen;
      writeSidebarOpen(next);
      return { sidebarOpen: next };
    });
  },
}));

// Note: Consider migrating to Zustand's persist middleware with skipHydration for simpler SSR rehydration
// Client-only rehydration to avoid SSR/client hydration mismatches.
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, sonarjs/different-types-comparison -- Direct comparison required for SSR safety
if (globalThis.window !== undefined) {
  // Defer until after first paint/hydration cycle
  globalThis.window.requestAnimationFrame(() => {
    // Only rehydrate if state wasn't changed by user interactions before RAF
    if (useUIStore.getState().sidebarOpen === INITIAL_SIDEBAR_OPEN) {
      useUIStore.setState({ sidebarOpen: readSidebarOpen() });
    }
  });
}
