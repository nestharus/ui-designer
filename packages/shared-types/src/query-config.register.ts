// Test-only module augmentation for TanStack Query default AppError
// This file is imported by src/__tests__/api.test.ts to verify the type hookup.
import type { AppError } from './query-config';
import '@tanstack/react-query';

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: AppError;
  }
}
