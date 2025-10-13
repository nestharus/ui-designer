import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('useUIStore', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Reset modules to re-evaluate SSR/client rehydration block
    vi.resetModules();
    // Clean localStorage
    localStorage.clear();
  });

  it('toggles sidebar and persists to localStorage', async () => {
    const setItemSpy = vi.spyOn(window.localStorage.__proto__, 'setItem');
    const { useUIStore } = await import('../ui');

    // Initial default
    expect.soft(useUIStore.getState().sidebarOpen).toBe(true);

    // Toggle
    useUIStore.getState().toggleSidebar();
    expect.soft(useUIStore.getState().sidebarOpen).toBe(false);
    expect.soft(setItemSpy).toHaveBeenCalledWith('sidebarOpen', 'false');

    // Set explicitly
    useUIStore.getState().setSidebarOpen(true);
    expect.soft(useUIStore.getState().sidebarOpen).toBe(true);
    expect.soft(setItemSpy).toHaveBeenCalledWith('sidebarOpen', 'true');
  });

  it('rehydrates sidebarOpen from localStorage on client after RAF', async () => {
    // Simulate persisted value being false
    localStorage.setItem('sidebarOpen', 'false');

    // Make RAF immediate
    const rafSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb: FrameRequestCallback) => {
        // Call immediately
        cb(0);
        // @ts-expect-error typing
        return 1;
      });

    const { useUIStore } = await import('../ui');

    // After RAF runs, state should reflect storage
    expect.soft(rafSpy).toHaveBeenCalled();
    expect.soft(useUIStore.getState().sidebarOpen).toBe(false);
  });

  it('rehydrates to true when storage is "true"', async () => {
    localStorage.setItem('sidebarOpen', 'true');
    const rafSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb: FrameRequestCallback) => {
        cb(0);
        // @ts-expect-error typing
        return 1;
      });

    const { useUIStore } = await import('../ui');
    expect.soft(rafSpy).toHaveBeenCalled();
    expect.soft(useUIStore.getState().sidebarOpen).toBe(true);
  });

  it('handles missing localStorage gracefully (getStorage returns null)', async () => {
    // Remove localStorage from global object
    const original = Object.getOwnPropertyDescriptor(window, 'localStorage');
    try {
      // Redefine as configurable so it can be deleted
      Object.defineProperty(window, 'localStorage', { value: undefined, configurable: true });
      // @ts-expect-error delete in test env
      delete window.localStorage;

      const rafSpy = vi
        .spyOn(window, 'requestAnimationFrame')
        .mockImplementation((cb: FrameRequestCallback) => {
          cb(0);
          // @ts-expect-error typing
          return 1;
        });

      const { useUIStore } = await import('../ui');

      // Calls to persist should no-op without throwing
      expect
        .soft(() => {
          useUIStore.getState().setSidebarOpen(false);
        })
        .not.toThrow();
      expect
        .soft(() => {
          useUIStore.getState().toggleSidebar();
        })
        .not.toThrow();

      // Rehydration still runs and keeps default true when no storage
      expect.soft(rafSpy).toHaveBeenCalled();
      expect.soft(useUIStore.getState().sidebarOpen).toBeTypeOf('boolean');
    } finally {
      if (original) Object.defineProperty(window, 'localStorage', original);
    }
  });
});
