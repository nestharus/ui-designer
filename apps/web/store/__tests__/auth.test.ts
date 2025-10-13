import { beforeEach, describe, expect, it } from 'vitest';

import { useAuthStore } from '../auth';

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ isAuthenticated: false });
  });
  it('sets authentication state', () => {
    expect.soft(useAuthStore.getState().isAuthenticated).toBe(false);
    useAuthStore.getState().setAuthenticated(true);
    expect.soft(useAuthStore.getState().isAuthenticated).toBe(true);
    useAuthStore.getState().setAuthenticated(false);
    expect.soft(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
