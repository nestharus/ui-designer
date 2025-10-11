# Testing Guide

## Overview

This project uses [Vitest](https://vitest.dev/) as the testing framework. All tests run with Bun as the runtime.

> **Important:** This project uses **Vitest**, not Bun's built-in test runner. Always use `bun run test` (which runs `vitest`) or `bunx vitest` commands. Do NOT use `bun test` as that would invoke Bun's test runner instead of Vitest.

> **Note:** For TypeScript configuration issues with Vitest, see the [TypeScript and Vitest Configuration Guide](./typescript-vitest-config.md).

## Writing Tests

### Test Structure

Follow the **Arrange-Act-Assert** (AAA) pattern:

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from './myFunction';

describe('myFunction', () => {
  it('should return expected result when given valid input', () => {
    // Arrange
    const input = 'test';
    const expected = 'TEST';

    // Act
    const result = myFunction(input);

    // Assert
    expect(result).toBe(expected);
  });
});
```

### Test Naming

Use descriptive test names that explain:

- What is being tested
- Under what conditions
- What the expected outcome is

```typescript
// ✅ Good
it('should throw error when input is null', () => {});
it('should return empty array when no items match filter', () => {});

// ❌ Bad
it('works', () => {});
it('test 1', () => {});
```

### Test Organization

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid data', () => {});
    it('should throw error when email is invalid', () => {});
    it('should hash password before saving', () => {});
  });

  describe('deleteUser', () => {
    it('should delete user by id', () => {});
    it('should throw error when user not found', () => {});
  });
});
```

## Running Tests

### Basic Commands

```bash
# Run all tests once
bun run test

# Run tests in watch mode
bun run test:watch

# Run tests with coverage
bun run test:coverage

# Run specific test file (pass args to Vitest)
bun run test -- path/to/test.ts

# Or use bunx vitest directly
bunx vitest run path/to/test.ts

# Run tests matching pattern
bunx vitest run --grep "UserService"

# Run specific package tests
bun run --filter @ui-designer/shared-types test
```

**Note:** All test commands use Vitest (not Bun's built-in test runner). The `bun run test` script proxies to `vitest run`.

### Test Filtering

```typescript
// Run only this test
it.only('should run only this test', () => {});

// Skip this test
it.skip('should skip this test', () => {});

// Run only this describe block
describe.only('UserService', () => {});

// Skip this describe block
describe.skip('UserService', () => {});
```

## Test Coverage

### Viewing Coverage

```bash
# Generate coverage report
bun run test:coverage

# Open HTML coverage report
open coverage/index.html
```

### Coverage Goals

- Aim for **80%+ code coverage**
- Focus on critical business logic
- Don't sacrifice test quality for coverage numbers

### What to Test

**✅ Do test:**

- Business logic and algorithms
- Edge cases and error conditions
- Public APIs and interfaces
- Data transformations
- Validation logic

**❌ Don't test:**

- Third-party libraries
- Simple getters/setters
- Framework code
- Configuration files

## Mocking

### Mocking Functions

```typescript
import { vi } from 'vitest';

// Mock a function
const mockFn = vi.fn();
mockFn.mockReturnValue('mocked value');

// Mock implementation
const mockFn = vi.fn((x) => x * 2);

// Verify calls
expect(mockFn).toHaveBeenCalledWith('arg');
expect(mockFn).toHaveBeenCalledTimes(1);
```

### Mocking Modules

```typescript
import { vi } from 'vitest';

// Mock entire module
vi.mock('./api', () => ({
  fetchUser: vi.fn().mockResolvedValue({ id: 1, name: 'John' }),
}));

// Partial mock
vi.mock('./utils', async () => {
  const actual = await vi.importActual('./utils');
  return {
    ...actual,
    someFunction: vi.fn(),
  };
});
```

### Mocking Timers

```typescript
import { vi } from 'vitest';

it('should handle delayed operations', () => {
  vi.useFakeTimers();

  const callback = vi.fn();
  setTimeout(callback, 1000);

  vi.advanceTimersByTime(1000);
  expect(callback).toHaveBeenCalled();

  vi.useRealTimers();
});
```

## Async Testing

### Testing Promises

```typescript
it('should resolve with user data', async () => {
  const user = await fetchUser(1);
  expect(user).toEqual({ id: 1, name: 'John' });
});

it('should reject with error', async () => {
  await expect(fetchUser(-1)).rejects.toThrow('User not found');
});
```

### Testing Callbacks

```typescript
it('should call callback with result', (done) => {
  fetchUser(1, (error, user) => {
    expect(error).toBeNull();
    expect(user).toEqual({ id: 1, name: 'John' });
    done();
  });
});
```

## React Component Testing

### Basic Component Test

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

it('should render button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

### Testing User Interactions

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Counter } from './Counter';

it('should increment counter on click', () => {
  render(<Counter />);

  const button = screen.getByRole('button', { name: /increment/i });
  fireEvent.click(button);

  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
```

### Testing Async Components

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { UserProfile } from './UserProfile';

it('should load and display user data', async () => {
  render(<UserProfile userId={1} />);

  expect(screen.getByText('Loading...')).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

## Turbo Pipeline Configuration

### Default Behavior

The global test pipeline runs against source code **without building dependencies first**, providing faster feedback during development.

### Package-Specific Configuration

If a specific package requires built outputs from its dependencies before running tests, create a package-scoped `turbo.json` in that package's root directory:

```json
{
  "extends": ["//"],
  "tasks": {
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
```

This configuration:

- Extends the root turbo configuration (`"extends": ["//"]`)
- Overrides only the test task for that specific package
- Ensures dependencies are built (`^build`) before running tests in that package
- Leaves other packages unaffected, maintaining fast test feedback elsewhere

**Use this pattern sparingly**—only when tests genuinely require built artifacts from dependencies.

## Best Practices

### 1. Keep Tests Fast

- Avoid unnecessary async operations
- Use mocks for external dependencies
- Don't test implementation details

### 2. Make Tests Independent

- Each test should run in isolation
- Don't rely on test execution order
- Clean up after each test

### 3. Use Descriptive Assertions

```typescript
// ✅ Good
expect(user.email).toBe('john@example.com');

// ❌ Bad
expect(user.email).toBeTruthy();
```

### 4. Test One Thing at a Time

```typescript
// ✅ Good
it('should validate email format', () => {});
it('should validate email length', () => {});

// ❌ Bad
it('should validate email', () => {
  // Tests format, length, domain, etc.
});
```

### 5. Avoid Test Duplication

Use `beforeEach` for common setup:

```typescript
describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    service = new UserService();
  });

  it('should create user', () => {
    // Use service
  });

  it('should delete user', () => {
    // Use service
  });
});
```

## Debugging Tests

### Using Console Logs

```typescript
it('should process data', () => {
  const data = processData(input);
  console.log('Processed data:', data);
  expect(data).toEqual(expected);
});
```

### Using Debugger

```typescript
it('should process data', () => {
  debugger; // Execution will pause here
  const data = processData(input);
  expect(data).toEqual(expected);
});
```

### Running Single Test

```bash
# Run only tests matching pattern
bunx vitest run --grep "should process data"

# Run specific file
bunx vitest run src/services/user.test.ts

# Or pass args through the test script
bun run test -- src/services/user.test.ts
```

## Common Patterns

### Testing Error Handling

```typescript
it('should throw error for invalid input', () => {
  expect(() => validateEmail('invalid')).toThrow('Invalid email');
});
```

### Testing Type Guards

```typescript
it('should return true for valid user object', () => {
  const obj = { id: 1, name: 'John' };
  expect(isUser(obj)).toBe(true);
});
```

### Testing Transformations

```typescript
it('should transform user data correctly', () => {
  const input = { firstName: 'John', lastName: 'Doe' };
  const output = transformUser(input);
  expect(output).toEqual({ fullName: 'John Doe' });
});
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
