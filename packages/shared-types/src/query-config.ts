import type { ErrorCode } from './common';

export interface AppError {
  readonly code: ErrorCode;
  readonly message: string;
  readonly details?: Record<string, unknown>;
  readonly statusCode?: number;
}
