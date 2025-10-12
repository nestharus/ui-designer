import { describe, expect, expectTypeOf, it } from 'vitest';

import { queryKeys } from '../api';
import { ErrorCode } from '../common';

import type { AppError } from '../api';
import type { UseQueryResult } from '@tanstack/react-query';

import '../query-config.register';

describe('query-config.ts - AppError', () => {
  it('establishes the expected TanStack Query error shape', () => {
    // Arrange
    const error: AppError = {
      code: ErrorCode.INTERNAL_ERROR,
      message: 'Something went wrong',
      details: { reason: 'unknown' },
      statusCode: 500,
    };

    // Act/Assert (soft)
    expect.soft(error.code).toBe(ErrorCode.INTERNAL_ERROR);

    // Type-level checks (do not count as runtime assertions)
    expectTypeOf<AppError['details']>().toEqualTypeOf<Record<string, unknown> | undefined>();
  });

  it('registers AppError as the default TanStack Query error type', () => {
    // Type-level check only
    type Observer = UseQueryResult;
    expectTypeOf<Observer['error']>().toEqualTypeOf<AppError | null>();
  });
});

describe('query-keys.ts - queryKeys factory', () => {
  it('builds hierarchical project keys', () => {
    // Arrange
    const listParams = { page: 1, pageSize: 20, search: 'dash' } as const;

    // Act
    const all = queryKeys.projects.all();
    const lists = queryKeys.projects.lists();
    const listKey = queryKeys.projects.list(listParams);
    const details = queryKeys.projects.details();
    const detail = queryKeys.projects.detail('123');

    // Assert (soft)
    expect.soft(all).toEqual(['projects']);
    expect.soft(lists).toEqual(['projects', 'lists']);
    expect.soft(listKey).toEqual(['projects', 'lists', listParams]);
    expect.soft(details).toEqual(['projects', 'details']);
    expect.soft(detail).toEqual(['projects', 'details', '123']);

    // Type-level
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
    // Arrange
    const filters = { region: 'us-east-1' } as Record<string, unknown>;

    // Act
    const all = queryKeys.agents.all();
    const lists = queryKeys.agents.lists();
    const list = queryKeys.agents.list(filters);
    const listEmpty = queryKeys.agents.list();
    const details = queryKeys.agents.details();
    const detailKey = queryKeys.agents.detail('agent-1');

    // Assert (soft)
    expect.soft(all).toEqual(['agents']);
    expect.soft(lists).toEqual(['agents', 'lists']);
    expect.soft(list).toEqual(['agents', 'lists', filters]);
    expect.soft(listEmpty).toEqual(['agents', 'lists']);
    expect.soft(details).toEqual(['agents', 'details']);
    expect.soft(detailKey).toEqual(['agents', 'details', 'agent-1']);

    // Type-level
    expectTypeOf(detailKey).toEqualTypeOf<readonly ['agents', 'details', string]>();
  });

  it('builds hierarchical design token keys', () => {
    // Act
    const all = queryKeys.designTokens.all();
    const lists = queryKeys.designTokens.lists();
    const list = queryKeys.designTokens.list('color');
    const listEmpty = queryKeys.designTokens.list();
    const details = queryKeys.designTokens.details();
    const detailKey = queryKeys.designTokens.detail('token-9');

    // Assert (soft)
    expect.soft(all).toEqual(['designTokens']);
    expect.soft(lists).toEqual(['designTokens', 'lists']);
    expect.soft(list).toEqual(['designTokens', 'lists', 'color']);
    expect.soft(listEmpty).toEqual(['designTokens', 'lists']);
    expect.soft(details).toEqual(['designTokens', 'details']);
    expect.soft(detailKey).toEqual(['designTokens', 'details', 'token-9']);

    // Type-level
    expectTypeOf(detailKey).toEqualTypeOf<readonly ['designTokens', 'details', string]>();
  });

  it('ensures detail keys extend their parent scope', () => {
    // Act/Assert (soft)
    const projectDetail = queryKeys.projects.detail('abc');
    const agentDetail = queryKeys.agents.detail('xyz');
    const tokenDetail = queryKeys.designTokens.detail('tok');

    expect.soft(projectDetail.slice(0, -1)).toEqual(queryKeys.projects.details());
    expect.soft(agentDetail.slice(0, -1)).toEqual(queryKeys.agents.details());
    expect.soft(tokenDetail.slice(0, -1)).toEqual(queryKeys.designTokens.details());
  });
});
