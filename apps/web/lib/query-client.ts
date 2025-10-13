import { QueryClient } from '@tanstack/react-query';

import type { AppError } from '@ui-designer/shared-types';

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: AppError;
  }
}

/**
 * Creates a new QueryClient instance for server-side rendering
 *
 * This should be called once per request on the server to avoid
 * sharing state between requests.
 *
 * @see docs/state-management-guide.md#hydrating-from-rsc
 */
export function getQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  });
}
