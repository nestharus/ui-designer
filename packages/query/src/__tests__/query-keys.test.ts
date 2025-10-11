import { describe, it, expect, expectTypeOf } from 'vitest';

import { queryKeys } from '../query-keys';

describe('query-keys factories', () => {
  it('projects keys', () => {
    const listParams = { page: 1 } as const;
    expect.soft(queryKeys.projects.all()).toEqual(['projects']);
    expect.soft(queryKeys.projects.lists()).toEqual(['projects', 'lists']);
    expect.soft(queryKeys.projects.list()).toEqual(['projects', 'lists']);
    expect.soft(queryKeys.projects.list(listParams)).toEqual(['projects', 'lists', listParams]);
    expect.soft(queryKeys.projects.details()).toEqual(['projects', 'details']);
    expect.soft(queryKeys.projects.detail('123')).toEqual(['projects', 'details', '123']);

    expectTypeOf(queryKeys.projects.detail('id')).toEqualTypeOf<
      readonly ['projects', 'details', string]
    >();
  });

  it('agents keys', () => {
    const filters = { region: 'us-east-1' } as const;
    expect.soft(queryKeys.agents.all()).toEqual(['agents']);
    expect.soft(queryKeys.agents.lists()).toEqual(['agents', 'lists']);
    expect.soft(queryKeys.agents.list()).toEqual(['agents', 'lists']);
    expect.soft(queryKeys.agents.list(filters)).toEqual(['agents', 'lists', filters]);
    expect.soft(queryKeys.agents.details()).toEqual(['agents', 'details']);
    expect.soft(queryKeys.agents.detail('agent-1')).toEqual(['agents', 'details', 'agent-1']);
  });

  it('design tokens keys', () => {
    expect.soft(queryKeys.designTokens.all()).toEqual(['designTokens']);
    expect.soft(queryKeys.designTokens.lists()).toEqual(['designTokens', 'lists']);
    expect.soft(queryKeys.designTokens.list()).toEqual(['designTokens', 'lists']);
    expect.soft(queryKeys.designTokens.list('color')).toEqual(['designTokens', 'lists', 'color']);
    expect.soft(queryKeys.designTokens.details()).toEqual(['designTokens', 'details']);
    expect.soft(queryKeys.designTokens.detail('tok')).toEqual(['designTokens', 'details', 'tok']);
  });
});
