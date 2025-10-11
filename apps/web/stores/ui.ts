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

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => {
    set({ sidebarOpen: open });
  },
  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },
}));
