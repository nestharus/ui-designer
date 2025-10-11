import { create } from 'zustand';

/**
 * Auth Store - Read-only UI state hydrated from server
 *
 * IMPORTANT: This is NOT the source of truth for authentication.
 * The server (cookies/JWT) is the source of truth.
 * This store is only for UI convenience (show/hide based on role, etc.)
 *
 * @see docs/state-management-guide.md#authentication-state
 */
interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    role: string;
  } | null;
  setAuth: (user: AuthState['user']) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  setAuth: (user) => {
    set({ isAuthenticated: true, user });
  },
  clearAuth: () => {
    set({ isAuthenticated: false, user: null });
  },
}));
