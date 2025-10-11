# Code Style Guide

## Overview

This project follows consistent code style guidelines enforced by ESLint, Prettier, and TypeScript. This guide provides additional context and best practices.

## TypeScript

### Always Use TypeScript

- All code must be written in TypeScript
- Avoid `any` type unless absolutely necessary
- Use `unknown` instead of `any` when type is truly unknown

```typescript
// ✅ Good
function processData(data: unknown): ProcessedData {
  if (typeof data === 'object' && data !== null) {
    // Type narrowing
  }
}

// ❌ Bad
function processData(data: any): ProcessedData {
  // No type safety
}
```

### Type Annotations

```typescript
// ✅ Good - Explicit return types for public APIs
export function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ Good - Inferred types for simple cases
const count = items.length;
const doubled = numbers.map((n) => n * 2);

// ❌ Bad - Unnecessary type annotations
const count: number = items.length;
```

### Interfaces vs Types

Use `interface` for object shapes, `type` for unions/intersections:

```typescript
// ✅ Good
interface User {
  id: number;
  name: string;
}

type Status = 'active' | 'inactive' | 'pending';
type Result = Success | Error;

// ❌ Bad
type User = {
  id: number;
  name: string;
};
```

### Generics

Use descriptive generic names:

```typescript
// ✅ Good
function mapArray<TInput, TOutput>(items: TInput[], mapper: (item: TInput) => TOutput): TOutput[] {
  return items.map(mapper);
}

// ❌ Bad
function mapArray<T, U>(items: T[], mapper: (item: T) => U): U[] {
  return items.map(mapper);
}
```

### Project-Specific Types

This project standardizes API access and error handling with TanStack Query utilities and the shared `AppError` type from `@ui-designer/shared-types`.

#### Query Options and Error Handling

Use `queryOptions()` to centralize data requirements and couple them with the shared `AppError` contract:

```typescript
import { queryOptions, useQuery } from '@tanstack/react-query';
import { queryKeys, ErrorCode, type AppError } from '@ui-designer/shared-types';

const projectListQuery = queryOptions({
  queryKey: queryKeys.projects.list({ page: 1, pageSize: 20 }),
  queryFn: async () => {
    const response = await fetch('/api/projects?page=1&pageSize=20');
    if (!response.ok) {
      throw {
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Unable to load projects',
        statusCode: response.status,
      } satisfies AppError;
    }
    return (await response.json()) as Project[];
  },
});

const { data, error, status } = useQuery(projectListQuery);

if (status === 'success') {
  // data is Project[]
}

if (status === 'error') {
  // error is AppError
}
```

TanStack Query exposes discriminated unions (`status`, `isError`, `isSuccess`) so we can narrow types without custom result wrappers. Prefer these helpers over reimplementing success/error containers.

#### Domain Types

Use domain types for consistent entity modeling:

```typescript
import type { Project, ProjectStatus, DesignToken } from '@ui-designer/shared-types';

// ✅ Good - Type-safe status checks
function canEditProject(project: Project): boolean {
  const editableStatuses: ProjectStatus[] = ['draft', 'in-progress'];
  return editableStatuses.includes(project.status);
}

// ✅ Good - Working with design tokens
function applyDesignToken(token: DesignToken): string {
  return `var(--${token.type}-${token.name})`;
}
```

**See the [@ui-designer/shared-types package](../packages/shared-types/README.md) and [API patterns guide](./api-patterns-guide.md) for full type definitions and usage guidelines.**

## Naming Conventions

### Variables and Functions

- Use `camelCase` for variables and functions
- Use descriptive names that explain purpose
- Avoid abbreviations unless widely understood

```typescript
// ✅ Good
const userCount = users.length;
const isAuthenticated = checkAuth();
function calculateTotalPrice(items: Item[]): number {}

// ❌ Bad
const cnt = users.length;
const auth = checkAuth();
function calc(items: Item[]): number {}
```

### Constants

Use `UPPER_SNAKE_CASE` for true constants:

```typescript
// ✅ Good
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = 'https://api.example.com';

// ❌ Bad
const maxRetryAttempts = 3;
const apiBaseUrl = 'https://api.example.com';
```

### Classes and Interfaces

Use `PascalCase` for classes, interfaces, and types:

```typescript
// ✅ Good
class UserService {}
interface UserProfile {}
type ApiResponse = {};

// ❌ Bad
class userService {}
interface userProfile {}
type apiResponse = {};
```

### Files and Directories

- Use `kebab-case` for file names
- Use `PascalCase` for React component files
- Match file name to primary export

```text
✅ Good
user-service.ts
UserProfile.tsx
api-client.ts

❌ Bad
UserService.ts
userProfile.tsx
API_Client.ts
```

## Functions

### Keep Functions Small

Functions should do one thing and do it well:

```typescript
// ✅ Good
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string): boolean {
  return password.length >= 8;
}

// ❌ Bad
function validateUser(email: string, password: string): boolean {
  // Validates email, password, and does other things
}
```

### Use Arrow Functions for Callbacks

```typescript
// ✅ Good
items.map((item) => item.name);
items.filter((item) => item.active);

// ❌ Bad
items.map(function (item) {
  return item.name;
});
```

### Avoid Nested Callbacks

```typescript
// ✅ Good
async function processUser(id: number): Promise<void> {
  const user = await fetchUser(id);
  const profile = await fetchProfile(user.profileId);
  await updateProfile(profile);
}

// ❌ Bad
function processUser(id: number): void {
  fetchUser(id, (user) => {
    fetchProfile(user.profileId, (profile) => {
      updateProfile(profile, () => {
        // Callback hell
      });
    });
  });
}
```

## React Components

### Component Structure

```typescript
// ✅ Good
import type { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button onClick={onClick} className={`btn btn-${variant}`}>
      {children}
    </button>
  );
}
```

### Props Naming

- Use `onEvent` for event handlers
- Use `isState` or `hasState` for booleans
- Use descriptive names for data props

```typescript
// ✅ Good
interface UserCardProps {
  user: User;
  isLoading: boolean;
  hasError: boolean;
  onUserClick: (user: User) => void;
  onDeleteClick: () => void;
}

// ❌ Bad
interface UserCardProps {
  user: User;
  loading: boolean;
  error: boolean;
  click: (user: User) => void;
  delete: () => void;
}
```

### Component Organization

```typescript
// 1. Imports
import { useState } from 'react';
import type { User } from '@/types';

// 2. Types
interface Props {
  user: User;
}

// 3. Component
export function UserProfile({ user }: Props) {
  // 3a. Hooks
  const [isEditing, setIsEditing] = useState(false);

  // 3b. Event handlers
  const handleEdit = () => setIsEditing(true);
  const handleSave = () => setIsEditing(false);

  // 3c. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

## Comments and Documentation

### JSDoc for Public APIs

````typescript
/**
 * Calculates the total price of items including tax.
 *
 * @param items - Array of items to calculate total for
 * @param taxRate - Tax rate as decimal (e.g., 0.1 for 10%)
 * @returns Total price including tax
 *
 * @example
 * ```ts
 * const total = calculateTotal([{ price: 100 }], 0.1);
 * // Returns 110
 * ```
 */
export function calculateTotal(items: Item[], taxRate: number): number {
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  return subtotal * (1 + taxRate);
}
````

### Inline Comments

Use comments to explain **why**, not **what**:

```typescript
// ✅ Good
// Retry failed requests to handle transient network errors
const maxRetries = 3;

// ❌ Bad
// Set max retries to 3
const maxRetries = 3;
```

### TODO Comments

```typescript
// TODO: Implement caching for better performance
// FIXME: Handle edge case when user is null
// NOTE: This is a temporary workaround for API limitation
```

## Error Handling

### Use Custom Error Classes

```typescript
// ✅ Good
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

throw new ValidationError('Invalid email format');

// ❌ Bad
throw new Error('Invalid email format');
```

### Handle Errors Appropriately

```typescript
// ✅ Good
try {
  const data = await fetchData();
  return processData(data);
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation error
  } else if (error instanceof NetworkError) {
    // Handle network error
  } else {
    // Handle unknown error
    throw error;
  }
}

// ❌ Bad
try {
  const data = await fetchData();
  return processData(data);
} catch (error) {
  console.log(error);
  return null;
}
```

## Imports

### Import Order

1. External dependencies
2. Internal absolute imports
3. Internal relative imports
4. Type imports

```typescript
// 1. External dependencies
import { useState } from 'react';
import { z } from 'zod';

// 2. Internal absolute imports
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

// 3. Internal relative imports
import { UserCard } from './UserCard';
import { formatDate } from '../utils';

// 4. Type imports
import type { User } from '@/types';
import type { Props } from './types';
```

### Use Named Imports

```typescript
// ✅ Good
import { Button, Input } from '@/components/ui';

// ❌ Bad
import * as UI from '@/components/ui';
```

## Formatting

### Line Length

- Keep lines under 100 characters
- Break long lines at logical points

```typescript
// ✅ Good
const result = calculateComplexValue(
  firstParameter,
  secondParameter,
  thirdParameter,
  fourthParameter,
  fifthParameter,
  sixthParameter
);

// ❌ Bad
const result = calculateComplexValue(
  firstParameter,
  secondParameter,
  thirdParameter,
  fourthParameter,
  fifthParameter,
  sixthParameter
);
```

### Indentation

- Use 2 spaces for indentation
- Prettier handles this automatically

### Trailing Commas

- Use trailing commas in multi-line structures
- Prettier handles this automatically

```typescript
// ✅ Good
const user = {
  id: 1,
  name: 'John',
  email: 'john@example.com',
};

// ❌ Bad
const user = {
  id: 1,
  name: 'John',
  email: 'john@example.com',
};
```

## Automated Enforcement

### ESLint

Run ESLint to check for code quality issues:

```bash
bun run lint
```

### Prettier

Format code automatically:

```bash
bun run format
```

### Git Hooks

Pre-commit hooks automatically:

- Format staged files
- Run linting
- Check types

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
