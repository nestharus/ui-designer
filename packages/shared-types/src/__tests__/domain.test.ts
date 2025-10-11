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
const isValidUri = (uri: string): boolean => {
  // Check if it's an absolute URL with a scheme
  if (uri.includes('://')) {
    try {
      new URL(uri);
      // Accept any successfully parsed URL (http, https, s3, etc.)
      return true;
    } catch {
      return false;
    }
  }

  // Check if it's a root-relative path
  if (uri.startsWith('/')) {
    // Ensure no illegal characters (null bytes, control characters, backslashes)
    // Check each character code to avoid control characters
    for (let i = 0; i < uri.length; i++) {
      const code = uri.codePointAt(i);
      if (!code) continue;
      // Reject control characters (0-31, 127) and backslashes (92)
      if ((code >= 0 && code <= 31) || code === 127 || code === 92) {
        return false;
      }
    }
    return uri.length > 1;
  }

  // Check if it's a safe relative storage path (e.g., "assets/frame.png")
  if (uri.length > 0) {
    // Ensure no illegal characters (control characters, backslashes)
    for (let i = 0; i < uri.length; i++) {
      const code = uri.codePointAt(i);
      if (!code) continue;
      // Reject control characters (0-31, 127) and backslashes (92)
      if ((code >= 0 && code <= 31) || code === 127 || code === 92) {
        return false;
      }
    }
    return true;
  }

  return false;
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
    expect(e.id).toBe('p1');
    expect(typeof project.name).toBe('string');
    expectTypeOf(project.description).toEqualTypeOf<string | null | undefined>();
    expectTypeOf(project.collaborators).toEqualTypeOf<readonly Collaborator[]>();
  });

  it('ProjectStatus literal type constraints', () => {
    const statuses: ProjectStatus[] = ['draft', 'in-progress', 'review', 'approved', 'archived'];
    expect(statuses.includes(project.status)).toBe(true);
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
    expect(['designer', 'researcher', 'engineer', 'agent']).toContain(c.role);
    expect(new Date(c.joinedAt).toString()).not.toBe('Invalid Date');
  });

  it('CollaboratorRole assignment compatibility', () => {
    const role: CollaboratorRole = 'agent';
    expect(role).toBe('agent');
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
    expect(token.type).toBe('color');
    expect(new Date(token.updatedAt).toString()).not.toBe('Invalid Date');
  });

  it('DesignTokenType literals', () => {
    const types: DesignTokenType[] = ['color', 'space', 'radius', 'shadow', 'typography', 'motion'];
    expect(types).toContain('shadow');
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
    expect(cats).toContain('semantic');
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
    expect(agent.type).toBe('synthesis');
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
    expect(types).toContain('orchestrator');
    expect(statuses).toContain('executing');
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
    expect(proto.metadata.darkMode).toBe(true);
  });

  it('PrototypeAssetKind literals and URI format', () => {
    const kinds: PrototypeAssetKind[] = [
      'frame',
      'component',
      'storyboard',
      'interaction',
      'document',
    ];
    expect(kinds).toContain(asset.kind);

    expect(isValidUri(asset.uri)).toBe(true);
  });
});
