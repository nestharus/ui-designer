export interface ProjectListParams {
  readonly page?: number;
  readonly pageSize?: number;
  readonly search?: string;
}
// Shared sentinel to ensure stable default reference for empty params
const EMPTY_PROJECT_PARAMS: ProjectListParams = Object.freeze({});

const projects = {
  all: () => ['projects'] as const,
  lists: () => [...projects.all(), 'lists'] as const,
  list: (params: ProjectListParams = EMPTY_PROJECT_PARAMS) =>
    [...projects.lists(), params] as const,
  details: () => [...projects.all(), 'details'] as const,
  detail: (id: string) => [...projects.details(), id] as const,
};

const agents = {
  all: () => ['agents'] as const,
  lists: () => [...agents.all(), 'lists'] as const,
  list: (filters?: Record<string, unknown>) => [...agents.lists(), filters] as const,
  details: () => [...agents.all(), 'details'] as const,
  detail: (id: string) => [...agents.details(), id] as const,
};

const designTokens = {
  all: () => ['designTokens'] as const,
  lists: () => [...designTokens.all(), 'lists'] as const,
  list: (category?: string) => [...designTokens.lists(), category] as const,
  details: () => [...designTokens.all(), 'details'] as const,
  detail: (id: string) => [...designTokens.details(), id] as const,
};

export const queryKeys = {
  projects,
  agents,
  designTokens,
} as const;
