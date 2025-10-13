# Testing Guide

## Overview

This project uses [Vitest](https://vitest.dev/) as the testing framework. All tests run with Bun as the runtime.

> **Important:** This project uses **Vitest**, not Bun's built-in test runner. Always use `bun run test` (which runs `vitest`) or `bunx vitest` commands. Do NOT use `bun test` as that would invoke Bun's test runner instead of Vitest.

> **Note:** For TypeScript configuration issues with Vitest, see the [TypeScript and Vitest Configuration Guide](./typescript-vitest-config.md).

## Writing Tests

### AAA + Traversal Rules

Adopt Arrange–Act–Assert with soft assertions and extracted traversals/conditions:

- Arrange, Act, Assert in order; keep bodies linear and readable.
- Extract traversal and conditions into helpers (generators or pure functions).
- Use soft assertions for multiple checks; keep all assertions in the test body.
- Avoid if-statements in the test body; encode branching inside the traversal helpers.
- Use loops in the test only to iterate over traversal outputs (no ad‑hoc iteration over raw structures).
- Prefer parameterized tests (`describe.each` / `it.each`) to cover scenarios.
- Group initialization/related tests with nested `describe` blocks; use `beforeAll/afterAll` or `beforeEach/afterEach` inside those blocks.

Example — traversal + soft assertions (JS/TS‑idiomatic):

```ts
import { describe, it, expect } from 'vitest';

function numberGeneratorTestCases(): Array<readonly [number, number, number, number]> {
  return [
    [1, 5, 0, 10],
    [5, 5, 0, 10],
    [3, 1, 0, 10],
    [3, 5, 0, 10],
    [3, 1, 0, 0],
    [3, 5, 5, 10],
  ] as const;
}

type ResultArray = { arrayIndex: number; array: number[] };
type ResultValue = { arrayIndex: number; valueIndex: number; value: number };

function* arrayStream(resultArrays: number[][]): Generator<ResultArray> {
  for (let arrayIndex = 0; arrayIndex < resultArrays.length; arrayIndex++) {
    yield { arrayIndex, array: resultArrays[arrayIndex] };
  }
}

function* valueStream(resultArrays: number[][]): Generator<ResultValue> {
  for (let arrayIndex = 0; arrayIndex < resultArrays.length; arrayIndex++) {
    const arr = resultArrays[arrayIndex];
    for (let valueIndex = 0; valueIndex < arr.length; valueIndex++) {
      yield { arrayIndex, valueIndex, value: arr[valueIndex] };
    }
  }
}

describe('NumberGeneratorService', () => {
  it.each(numberGeneratorTestCases())(
    'count=%s, size=%s, min=%s, max=%s',
    (count, size, rangeMin, rangeMax) => {
      // Arrange
      const service = new NumberGeneratorService({ count, size, min: rangeMin, max: rangeMax });

      // Act
      const result = service.generateArrays();

      // Assert (soft assertions kept in test)
      expect.soft(result).toHaveLength(count);

      for (const { arrayIndex, array } of arrayStream(result)) {
        expect.soft(array, `array[${arrayIndex}] length`).toHaveLength(size);
      }

      for (const { arrayIndex, valueIndex, value } of valueStream(result)) {
        expect
          .soft(value, `min violation at [${arrayIndex}][${valueIndex}]`)
          .toBeGreaterThanOrEqual(rangeMin);
        expect
          .soft(value, `max violation at [${arrayIndex}][${valueIndex}]`)
          .toBeLessThanOrEqual(rangeMax);
      }

      for (const { arrayIndex, array } of arrayStream(result)) {
        const distinct = new Set(array).size;
        expect.soft(distinct, `dupes at array[${arrayIndex}]`).toBe(array.length);
      }
    },
  );
});
```

Notes:

- Assertions remain in the test; the helpers only provide traversal/structure.
- Soft assertions surface all violations in one run without short‑circuiting on first failure.
  Vitest automatically aggregates and reports all `expect.soft` failures at the end of each test — no explicit assertAll or runner is needed.
  Use `it.each` when each tuple produces a single test; use `describe.each` when multiple tests share the same parameters and you need several `it` blocks.
  Prefer generator functions (`function*`) for traversals over materializing arrays to avoid large intermediate collections and to express intent more clearly (similar to Java Streams).

### Soft vs. Hard Assertions

- Prefer `expect.soft(...)` for assertions in Vitest and Playwright.
- Soft assertions collect all failures and report them together at the end of the test, improving triage.
- Hard assertions (`expect(...)`) are allowed only when an immediate fail-fast is essential (e.g., before an expensive step).
- Lint rule: tests are enforced to use `expect.soft` via an ESLint rule that disallows `expect(...)` in test files.

Example:

```ts
// ✅ Preferred
expect.soft(user.name).toBe('Jane');
expect.soft(user.age).toBeGreaterThan(18);

// ❌ Avoid (use only when fail-fast is truly needed)
expect(user.name).toBe('Jane');
```

Playwright example:

```ts
// Prefer soft for multiple conditions
await expect.soft(page.getByTestId('app-root')).toBeVisible();
await expect.soft(page.locator('svg[data-icon="rocket"]')).toBeVisible();
```

Sonar rule nuance:

- Some static analysis rules (e.g., `sonarjs/assertions-in-tests`) may not recognize `expect.soft` as an assertion.
- If a false positive appears, add a targeted disable comment at the top of the file or near the assertion:

```ts
/* eslint-disable sonarjs/assertions-in-tests */
```

Use this sparingly, and only when `expect.soft` is used correctly.

#### Playwright Async Patterns

Playwright has two kinds of assertions:

- Locator assertions (async, auto‑retry): use `await expect.soft(locator).matcher()`
- Plain value assertions (sync): `const value = await fn(); expect.soft(value).toBe(expected)`

Good patterns:

```ts
// Locator assertions — always await the matcher
await expect.soft(page.getByTestId('app-root')).toBeVisible();
await expect.soft(page.locator('h1')).toContainText('Welcome');

// Plain values — await the producer, not the expect
const status = await getStatus();
expect.soft(status).toBe('OK');
```

Avoid these:

```ts
// ❌ Awaiting the wrapper without a matcher (no assertion runs)
await expect.soft(page.locator('h1'));

// ❌ Forgetting to await async matcher (returns a Promise)
expect.soft(page.locator('h1')).toBeVisible();

// ❌ Awaiting expect on a plain value (matcher is sync)
await expect.soft(status).toBe('OK');
```

Rule of thumb:

- If the subject is a Playwright `Locator`/`Page`, await the matcher: `await expect.soft(locator).toBe...`
- If the subject is a plain value, await the function first, then assert synchronously: `expect.soft(value).toBe(...)`

Common Pitfalls That Cause Hangs:

- Awaiting the wrapper without calling a matcher: `await expect.soft(locator);`
- Forgetting to await an async matcher: `expect.soft(locator).toBeVisible();`
- Very long/never‑resolving matchers due to auto‑wait conditions that never stabilize
- Dangling async work elsewhere (unawaited `waitFor*`, open websockets, un-cleared `setInterval`)

Quick debugging tips:

- Lower the assertion timeout: `test.use({ expect: { timeout: 2000 } })`
- Enable tracing or debug logs: `--debug` or `DEBUG=pw:api`
- Search for unawaited matchers and wrapper‑only awaits

Note: `await expect.soft(...)` alone does not hang; it simply resolves without running a matcher. Apparent hangs usually come from not awaiting the matcher or a matcher that never stabilizes.

See `docs/e2e-testing-guide.md` for more Playwright‑specific patterns.

### Automated Migration

The codemod converts `expect(...)` to `expect.soft(...)` and preserves `await` when present (e.g., `await expect(...)` becomes `await expect.soft(...)`). It handles both Vitest (sync) and Playwright (async) patterns.

Run the codemod across unit, integration, and E2E tests:

```bash
bun run codemod:expect-soft
```

After running, manually review Playwright tests to ensure:

- All `await expect.soft(locator)` calls include a matcher (e.g., `.toBeVisible()`)
- Plain value assertions follow: `const value = await fn(); expect.soft(value).toBe(...)` (no `await` on `expect.soft`)

The codemod is a starting point; manual review avoids the pitfalls in the “Playwright Async Patterns” section.

Nested blocks for initialization and related tests:

```ts
import { describe, beforeAll, afterAll, it, expect } from 'vitest';

describe('Database', () => {
  let client: { connect: () => Promise<void>; close: () => Promise<void> };

  beforeAll(async () => {
    client = /* create client */ {
      connect: async () => {},
      close: async () => {},
    };
    await client.connect();
  });

  afterAll(async () => {
    await client.close();
  });

  describe('UserRepository', () => {
    it('creates and fetches a user (single assertion)', async () => {
      const issues: string[] = [];
      // Arrange/Act via helpers...
      // push to issues for any violations
      expect(issues).toEqual([]);
    });
  });
});
```

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

### Unit, Integration, and All Tests

```bash
# Unit tests (co-located under app/, features/, lib/, hooks/, store/, server/)
bun run test:unit
bun run test:unit:watch

# Integration tests (apps/web/tests/integration/)
bun run test:integration
bun run test:integration:watch

# All tests using the base config
bun run test:all

# With coverage
bun run test:coverage:unit
bun run test:coverage:integration
bun run test:coverage:all

# Run specific test file (pass args to Vitest)
bun run test:all -- path/to/test.ts

# Or use bunx vitest directly
bunx vitest run path/to/test.ts

# Run tests matching pattern
bunx vitest run --grep "UserService"

# Run tests for a specific package
bun run --filter @ui-designer/shared-types test
```

**Note:** All test commands use Vitest (not Bun's built-in test runner). The unit/integration configs are in `apps/web/` and the base config runs all tests.

E2E tests live at `apps/web/tests/e2e/` and are configured via the root `playwright.config.ts`.

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
# Generate coverage report (all tests)
bun run test:coverage:all

# Open HTML coverage report
open coverage/index.html

# LLM coverage input: per-workspace JSON
# Vitest writes coverage/coverage-final.json alongside lcov + HTML.
# For web app:
cat apps/web/coverage/coverage-final.json | jq . > /dev/null
# For packages:
cat packages/shared-types/coverage/coverage-final.json | jq . > /dev/null
cat packages/query/coverage/coverage-final.json | jq . > /dev/null

# Optionally merge JSONs for a single LLM input (example approach)
# jq -s 'reduce .[] as $item ({}; . * $item)' \
#   apps/web/coverage/coverage-final.json \\
#   packages/shared-types/coverage/coverage-final.json \\
#   packages/query/coverage/coverage-final.json \\
#   > coverage/coverage-final-merged.json
```

### Coverage Goals

- Unit tests: aim for **80%+** (branches, functions, lines, statements)
- Integration tests: aim for **70%+**
- Overall target: **80%**
- Focus on critical business logic; do not chase 100% blindly

Note: `packages/shared-types` uses the same 80% coverage thresholds as other packages (see `packages/shared-types/vitest.config.ts`). While it is a types-first package, it contains runtime constructs (enums, helpers) that are validated at runtime and included in coverage.

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

## E2E Testing Best Practices

When testing dynamic content in SSR apps (like Next.js), avoid hardcoded timeouts. Prefer Playwright's web-first assertions which automatically retry until conditions are met or the assertion timeout elapses.

Recommended — use a project-specific hydration marker (e.g., `data-testid="app-root"`) instead of assuming a semantic element like `main` exists everywhere.

Example — wait for hydration with an explicit marker, then assert on dynamic elements:

```ts
import { test, expect } from '@playwright/test';

test('Font Awesome icons visible after hydration', async ({ page }) => {
  await page.goto('/');

  // Wait for the app hydration marker
  await expect(page.getByTestId('app-root')).toBeVisible();

  // Then assert on dynamically rendered content
  await expect(page.locator('svg[data-icon="coffee"]')).toBeVisible();
});
```

Note: `page.waitForLoadState('networkidle')` can be used sparingly to account for apps that finish hydrating after network idleness. Prefer explicit hydration markers where possible, as `networkidle` can be overly broad and slow.

This pattern eliminates race conditions during React hydration and is preferred over `waitForTimeout`. See the full guide in `docs/e2e-testing-guide.md` for comprehensive Playwright patterns.

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

### Test Placement Strategy

- Co-locate unit tests under `__tests__/` next to the code they cover (e.g., `features/<name>/__tests__`, `lib/__tests__`).
- Put cross-cutting integration tests under `apps/web/tests/integration/` and shared fixtures under `apps/web/tests/fixtures/`.
- Keep E2E tests under `apps/web/tests/e2e/`.
- `packages/shared-types` participates in coverage with 80% thresholds (it contains runtime code validated by tests).
