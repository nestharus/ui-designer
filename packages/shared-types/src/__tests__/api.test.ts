import { describe, expect, expectTypeOf, it } from 'vitest';

import { queryKeys } from '../api';
import { ErrorCode } from '../common';

import type { AppError } from '../api';
import type { UseQueryResult } from '@tanstack/react-query';

import '../query-config.register';

describe('query-config.ts - AppError', () => {
  it('establishes the expected TanStack Query error shape', () => {
    const error: AppError = {
      code: ErrorCode.INTERNAL_ERROR,
      message: 'Something went wrong',
      details: { reason: 'unknown' },
      statusCode: 500,
    };
    expect(error.code).toBe(ErrorCode.INTERNAL_ERROR);
    expectTypeOf<AppError['details']>().toEqualTypeOf<Record<string, unknown> | undefined>();
  });

  it('registers AppError as the default TanStack Query error type', () => {
    type Observer = UseQueryResult;
    expectTypeOf<Observer['error']>().toEqualTypeOf<AppError | null>();
  });
});

describe('query-keys.ts - queryKeys factory', () => {
  it('builds hierarchical project keys', () => {
    expect(queryKeys.projects.all()).toEqual(['projects']);
    expect(queryKeys.projects.lists()).toEqual(['projects', 'lists']);
    const listParams = { page: 1, pageSize: 20, search: 'dash' } as const;
    const listKey = queryKeys.projects.list(listParams);
    expect(listKey).toEqual(['projects', 'lists', listParams]);
    expect(queryKeys.projects.details()).toEqual(['projects', 'details']);
    expect(queryKeys.projects.detail('123')).toEqual(['projects', 'details', '123']);
    expectTypeOf(listKey).toEqualTypeOf<
      readonly [
        'projects',
        'lists',
        {
          readonly page?: number;
          readonly pageSize?: number;
          readonly search?: string;
        },
      ]
    >();
  });

  it('builds hierarchical agent keys', () => {
    expect(queryKeys.agents.all()).toEqual(['agents']);
    expect(queryKeys.agents.lists()).toEqual(['agents', 'lists']);
    const filters = { region: 'us-east-1' } as Record<string, unknown>;
    expect(queryKeys.agents.list(filters)).toEqual(['agents', 'lists', filters]);
    expect(queryKeys.agents.list(undefined)).toEqual(['agents', 'lists', undefined]);
    expect(queryKeys.agents.details()).toEqual(['agents', 'details']);
    const detailKey = queryKeys.agents.detail('agent-1');
    expect(detailKey).toEqual(['agents', 'details', 'agent-1']);
    expectTypeOf(detailKey).toEqualTypeOf<readonly ['agents', 'details', string]>();
  });

  it('builds hierarchical design token keys', () => {
    expect(queryKeys.designTokens.all()).toEqual(['designTokens']);
    expect(queryKeys.designTokens.lists()).toEqual(['designTokens', 'lists']);
    expect(queryKeys.designTokens.list('color')).toEqual(['designTokens', 'lists', 'color']);
    expect(queryKeys.designTokens.list(undefined)).toEqual(['designTokens', 'lists', undefined]);
    expect(queryKeys.designTokens.details()).toEqual(['designTokens', 'details']);
    const detailKey = queryKeys.designTokens.detail('token-9');
    expect(detailKey).toEqual(['designTokens', 'details', 'token-9']);
    expectTypeOf(detailKey).toEqualTypeOf<readonly ['designTokens', 'details', string]>();
  });

  it('ensures detail keys extend their parent scope', () => {
    const projectDetail = queryKeys.projects.detail('abc');
    expect(projectDetail.slice(0, -1)).toEqual(queryKeys.projects.details());

    const agentDetail = queryKeys.agents.detail('xyz');
    expect(agentDetail.slice(0, -1)).toEqual(queryKeys.agents.details());

    const tokenDetail = queryKeys.designTokens.detail('tok');
    expect(tokenDetail.slice(0, -1)).toEqual(queryKeys.designTokens.details());
  });
});
