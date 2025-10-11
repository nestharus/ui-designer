import type { Entity, Nullable } from './common';

export interface Project extends Entity {
  readonly name: string;
  readonly description: Nullable<string>;
  readonly status: ProjectStatus;
  readonly ownerId: string;
  readonly collaborators: readonly Collaborator[];
}

export type ProjectStatus = 'draft' | 'in-progress' | 'review' | 'approved' | 'archived';

export interface Collaborator extends Entity {
  readonly role: CollaboratorRole;
  /** ISO 8601 timestamp string */
  readonly joinedAt: string;
}

export type CollaboratorRole = 'designer' | 'researcher' | 'engineer' | 'agent';

export interface DesignToken extends Entity {
  readonly name: string;
  readonly value: string;
  readonly type: DesignTokenType;
  readonly category: DesignTokenCategory;
  readonly description?: string;
  readonly source?: string;
}

export type DesignTokenType = 'color' | 'space' | 'radius' | 'shadow' | 'typography' | 'motion';

export type DesignTokenCategory =
  | 'brand'
  | 'intent'
  | 'surface'
  | 'semantic'
  | 'component'
  | 'experimental';

export interface Agent extends Entity {
  readonly type: AgentType;
  readonly status: AgentStatus;
  readonly capabilities: readonly AgentCapability[];
  readonly avatarUrl?: string;
}

export type AgentType =
  | 'synthesis'
  | 'exploration'
  | 'critique'
  | 'prototype'
  | 'handoff'
  | 'orchestrator';

export type AgentStatus = 'idle' | 'executing' | 'error' | 'offline';

export interface AgentCapability {
  readonly name: string;
  readonly description: string;
  readonly inputs: readonly string[];
  readonly outputs: readonly string[];
}

export interface Specification extends Entity {
  readonly projectId: string;
  readonly content: string;
  readonly version: string;
  readonly authorId: string;
  readonly tags: readonly string[];
}

export interface Prototype extends Entity {
  readonly projectId: string;
  readonly name: string;
  readonly assets: readonly PrototypeAsset[];
  readonly metadata: Readonly<PrototypeMetadata>;
}

export interface PrototypeAsset extends Entity {
  /** Absolute URL or storage path */
  readonly uri: string;
  readonly kind: PrototypeAssetKind;
  readonly description?: string;
  readonly createdBy: string;
}

export type PrototypeAssetKind = 'frame' | 'component' | 'storyboard' | 'interaction' | 'document';

export interface PrototypeMetadata {
  readonly framework?: string;
  readonly buildVersion?: string;
  readonly [key: string]: string | number | boolean | undefined | null | Record<string, unknown>;
}
