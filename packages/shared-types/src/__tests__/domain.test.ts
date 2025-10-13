import { describe, expect, expectTypeOf, it } from 'vitest';

import type { Entity, Nullable } from '../common';
import type {
  Agent,
  AgentCapability,
  AgentStatus,
  AgentType,
  Collaborator,
  CollaboratorRole,
  DesignToken,
  DesignTokenCategory,
  DesignTokenType,
  Project,
  ProjectStatus,
  Prototype,
  PrototypeAsset,
  PrototypeAssetKind,
  Specification,
} from '../domain';

// Robust URL validation helper
const hasIllegalPathChars = (value: string): boolean => {
  for (let i = 0; i < value.length; i++) {
    const code = value.codePointAt(i);
    if (!code) continue;
    // Reject control characters (0-31, 127) and backslashes (92)
    if ((code >= 0 && code <= 31) || code === 127 || code === 92) {
      return true;
    }
  }
  return false;
};

const isValidUri = (uri: string): boolean => {
  if (uri.length === 0) return false;

  // Absolute URL with a scheme
  if (uri.includes('://')) {
    try {
      // Accept any successfully parsed URL (http, https, s3, etc.)
      new URL(uri);
      return true;
    } catch {
      return false;
    }
  }

  // Root-relative path
  if (uri.startsWith('/')) {
    return !hasIllegalPathChars(uri) && uri.length > 1;
  }

  // Relative storage path (e.g., "assets/frame.png")
  return !hasIllegalPathChars(uri);
};

describe('domain.ts - Project', () => {
  const collaborator: Collaborator = {
    id: 'c1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    role: 'designer',
    joinedAt: new Date().toISOString(),
  };

  const project: Project = {
    id: 'p1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    name: 'Project',
    description: null as Nullable<string>,
    status: 'draft',
    ownerId: 'u1',
    collaborators: [collaborator] as const,
  };

  it('extends Entity and has required fields', () => {
    const e: Entity = project;
    expect.soft(e.id).toBe('p1');
    expect.soft(typeof project.name).toBe('string');
    expectTypeOf(project.description).toEqualTypeOf<string | null | undefined>();
    expectTypeOf(project.collaborators).toEqualTypeOf<readonly Collaborator[]>();
  });

  it('ProjectStatus literal type constraints', () => {
    const statuses: ProjectStatus[] = ['draft', 'in-progress', 'review', 'approved', 'archived'];
    expect.soft(statuses.includes(project.status)).toBe(true);
  });
});

describe('domain.ts - Collaborator', () => {
  it('extends Entity and respects role', () => {
    const c: Collaborator = {
      id: 'c2',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      role: 'engineer',
      joinedAt: new Date().toISOString(),
    };
    expect.soft(['designer', 'researcher', 'engineer', 'agent'].includes(c.role)).toBe(true);
    expect.soft(new Date(c.joinedAt).toString()).not.toBe('Invalid Date');
  });

  it('CollaboratorRole assignment compatibility', () => {
    const role: CollaboratorRole = 'agent';
    expect.soft(role).toBe('agent');
  });
});

describe('domain.ts - DesignToken', () => {
  it('extends Entity and validates fields', () => {
    const token: DesignToken = {
      id: 't1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      name: 'Primary',
      value: '#ffffff',
      type: 'color',
      category: 'brand',
      description: 'Primary brand color',
    };
    expect.soft(token.type).toBe('color');
    expect.soft(new Date(token.updatedAt).toString()).not.toBe('Invalid Date');
  });

  it('DesignTokenType literals', () => {
    const types: DesignTokenType[] = ['color', 'space', 'radius', 'shadow', 'typography', 'motion'];
    expect.soft(types).toContain('shadow');
  });

  it('DesignTokenCategory literals', () => {
    const cats: DesignTokenCategory[] = [
      'brand',
      'intent',
      'surface',
      'semantic',
      'component',
      'experimental',
    ];
    expect.soft(cats).toContain('semantic');
  });
});

describe('domain.ts - Agent', () => {
  const cap: AgentCapability = {
    name: 'analyze',
    description: 'Analyze inputs',
    inputs: ['text'] as const,
    outputs: ['summary'] as const,
  };

  it('extends Entity and validates fields', () => {
    const agent: Agent = {
      id: 'a1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: 'synthesis',
      status: 'idle',
      capabilities: [cap] as const,
      avatarUrl: 'https://example.com/a.png',
    };
    expectTypeOf(agent.capabilities).toEqualTypeOf<readonly AgentCapability[]>();
    expect.soft(agent.type).toBe('synthesis');
  });

  it('AgentType and AgentStatus literals', () => {
    const types: AgentType[] = [
      'synthesis',
      'exploration',
      'critique',
      'prototype',
      'handoff',
      'orchestrator',
    ];
    const statuses: AgentStatus[] = ['idle', 'executing', 'error', 'offline'];
    expect.soft(types.includes('orchestrator')).toBe(true);
    expect.soft(statuses.includes('executing')).toBe(true);
  });
});

describe('domain.ts - Specification', () => {
  it('extends Entity and validates fields', () => {
    const spec: Specification = {
      id: 's1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      projectId: 'p1',
      content: 'Spec content',
      version: '1.0.0',
      authorId: 'u1',
      tags: ['a', 'b'] as const,
    };
    expectTypeOf(spec.tags).toEqualTypeOf<readonly string[]>();
  });
});

describe('domain.ts - Prototype and PrototypeAsset', () => {
  const asset: PrototypeAsset = {
    id: 'pa1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    uri: 'https://cdn.example.com/frame/1',
    kind: 'frame',
    createdBy: 'u1',
  };

  it('Prototype extends Entity and validates fields', () => {
    const proto: Prototype = {
      id: 'pr1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      projectId: 'p1',
      name: 'Prototype A',
      assets: [asset] as const,
      metadata: Object.freeze({ darkMode: true }),
    };
    expectTypeOf(proto.assets).toEqualTypeOf<readonly PrototypeAsset[]>();
    expect.soft(proto.metadata.darkMode).toBe(true);
  });

  it('PrototypeAssetKind literals and URI format', () => {
    const kinds: PrototypeAssetKind[] = [
      'frame',
      'component',
      'storyboard',
      'interaction',
      'document',
    ];
    expect.soft(kinds.includes(asset.kind)).toBe(true);
    expect.soft(isValidUri(asset.uri)).toBe(true);
  });
});
