import { render } from '@testing-library/react';

import { Providers } from '@/app/providers';

import type { RenderResult } from '@testing-library/react';
import type { ReactNode } from 'react';

/**
 * Render helper for integration tests that need app-wide Providers
 * (React Query, Zustand wiring, Devtools in dev, etc.).
 */
export function renderWithProviders(
  ui: ReactNode,
  options?: Parameters<typeof render>[1],
): RenderResult {
  return render(<Providers>{ui}</Providers>, options);
}
