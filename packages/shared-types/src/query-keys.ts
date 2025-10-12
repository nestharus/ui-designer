export interface ProjectListParams {
  readonly page?: number;
  readonly pageSize?: number;
  readonly search?: string;
}

type KeyPart = string | number | boolean | null | object;

const t = <const T extends readonly KeyPart[]>(...args: T) => args;
const append = <const A extends readonly KeyPart[], const B extends readonly KeyPart[]>(
  a: A,
  ...b: B
): readonly [...A, ...B] => [...a, ...b] as readonly [...A, ...B];

const projects = {
  all: () => t('projects'),
  lists: () => append(projects.all(), 'lists'),
  list: (params?: ProjectListParams) =>
    (params
      ? append(projects.lists(), params)
      : projects.lists()) as typeof params extends ProjectListParams
      ? readonly ['projects', 'lists', ProjectListParams]
      : readonly ['projects', 'lists'],
  details: () => append(projects.all(), 'details'),
  detail: (id: string) => append(projects.details(), id),
};

const agents = {
  all: () => t('agents'),
  lists: () => append(agents.all(), 'lists'),
  list: (filters?: Record<string, unknown>) =>
    filters ? append(agents.lists(), filters) : agents.lists(),
  details: () => append(agents.all(), 'details'),
  detail: (id: string) => append(agents.details(), id),
};

const designTokens = {
  all: () => t('designTokens'),
  lists: () => append(designTokens.all(), 'lists'),
  list: (category?: string) =>
    category ? append(designTokens.lists(), category) : designTokens.lists(),
  details: () => append(designTokens.all(), 'details'),
  detail: (id: string) => append(designTokens.details(), id),
};

export const queryKeys = {
  projects,
  agents,
  designTokens,
};
