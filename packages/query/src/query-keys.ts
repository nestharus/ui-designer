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

const projects = (() => {
  const all = () => t('projects');
  const lists = () => append(all(), 'lists');
  function list(): readonly ['projects', 'lists'];
  function list(params: undefined): readonly ['projects', 'lists'];
  function list(params: ProjectListParams): readonly ['projects', 'lists', ProjectListParams];
  function list(params?: ProjectListParams) {
    return params ? append(lists(), params) : lists();
  }
  const details = () => append(all(), 'details');
  const detail = (id: string) => append(details(), id);
  return { all, lists, list, details, detail };
})();

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
