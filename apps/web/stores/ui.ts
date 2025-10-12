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

function readSidebarOpen(): boolean {
  const storage = getStorage();
  const raw = storage?.getItem('sidebarOpen');
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return true;
}

function writeSidebarOpen(value: boolean): void {
  const storage = getStorage();
  storage?.setItem('sidebarOpen', value ? 'true' : 'false');
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: readSidebarOpen(),
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
