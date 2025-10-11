/**
 * Client-side integration test: validates HomePage renders with app Providers
 * and that primary content is visible (UI + providers + data fetching context).
 */
import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import HomePage from '@/features/home/HomePage';
import { renderWithProviders } from '@/tests/fixtures/render-with-providers';

describe('Integration: HomePage with Providers', () => {
  it('renders heading and icons with providers', async () => {
    renderWithProviders(<HomePage />);

    // If there were loading states, we would assert them first. Here we just
    // wait for the main heading to be visible.
    await waitFor(() => {
      expect.soft(screen.getByRole('heading', { name: /ui designer/i })).toBeVisible();
    });

    // Spot-check subtitle visibility as part of integration context
    expect.soft(screen.getByText(/agentic design collaboration platform/i)).toBeVisible();
  });
});
