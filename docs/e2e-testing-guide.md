# End-to-End Testing with Playwright

## Overview

This project uses [Playwright](https://playwright.dev/) for end-to-end testing. Playwright tests run against the actual application in a real browser, testing the full user experience.

## Running E2E Tests

### Basic Commands

```bash
# Run all E2E tests
bun run test:e2e

# Run tests with UI mode (interactive)
bun run test:e2e:ui

# Run specific test file
bunx playwright test apps/web/tests/e2e/home.spec.ts

# Run tests in headed mode (see browser)
bunx playwright test --headed

# Debug tests
bunx playwright test --debug
```

### First Time Setup

Playwright requires browser binaries to be installed:

```bash
bun run playwright:install
```

This downloads Chromium, Firefox, and WebKit browsers.

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/');

    // Interact with the page
    await page.click('button');

    // Assert expectations
    await expect(page.locator('h1')).toContainText('Expected Text');
  });
});
```

### Common Patterns

#### Navigation

```typescript
await page.goto('/about');
await page.goBack();
await page.reload();
```

#### Locators

```typescript
// By role (preferred)
await page.getByRole('button', { name: 'Submit' });

// By text
await page.getByText('Welcome');

// By test ID
await page.getByTestId('user-profile');

// By CSS selector
await page.locator('.my-class');
```

#### Interactions

```typescript
// Click
await page.click('button');

// Fill input
await page.fill('input[name="email"]', 'test@example.com');

// Select option
await page.selectOption('select', 'option-value');

// Upload file
await page.setInputFiles('input[type="file"]', 'path/to/file.pdf');
```

#### Assertions

```typescript
// Visibility
await expect(page.locator('h1')).toBeVisible();
await expect(page.locator('.error')).toBeHidden();

// Text content
await expect(page.locator('h1')).toContainText('Welcome');
await expect(page.locator('h1')).toHaveText('Welcome');

// Attributes
await expect(page.locator('button')).toBeDisabled();
await expect(page.locator('input')).toHaveValue('test');

// Count
await expect(page.locator('.item')).toHaveCount(5);
```

### Soft Assertions in Playwright

Playwright supports `expect.soft(...)` to collect multiple assertion failures within a single test.

- For locator assertions, always use `await expect.soft(locator).matcher()` to benefit from auto‑wait and retries.
- For plain values, await the async function first, then assert synchronously: `const value = await getStatus(); expect.soft(value).toBe('OK');`.

Good patterns:

```ts
await expect.soft(page.getByTestId('app-root')).toBeVisible();
await expect.soft(page.locator('h1')).toContainText('Welcome');

const status = await getStatus();
expect.soft(status).toBe('OK');
```

Avoid these:

```ts
// Awaiting the wrapper without a matcher (no assertion runs)
await expect.soft(page.locator('h1'));

// Forgetting to await async matcher
expect.soft(page.locator('h1')).toBeVisible();

// Awaiting expect on a plain value (matcher is sync)
await expect.soft(status).toBe('OK');
```

Why Tests Hang

- Awaiting the wrapper without a matcher
- Forgetting to await async matchers
- Matchers that never stabilize due to conditions that don’t become true
- Dangling async work (unawaited waits, open sockets, setInterval)

Debugging tips:

- Lower assertion timeout: `test.use({ expect: { timeout: 2000 } })`
- Use `--debug` or `DEBUG=pw:api`
- Enable tracing (`trace: 'retain-on-failure'`) and inspect traces

Timeout configurations in `playwright.config.ts` (test timeout, action timeout, expect timeout) help prevent infinite hangs.
See the general `docs/testing-guide.md` for broader soft assertion guidance.

### Testing Responsive Design

```typescript
test('should be responsive', async ({ page }) => {
  await page.goto('/');

  // Mobile
  await page.setViewportSize({ width: 375, height: 667 });
  await expect(page.locator('.mobile-menu')).toBeVisible();

  // Desktop
  await page.setViewportSize({ width: 1920, height: 1080 });
  await expect(page.locator('.desktop-nav')).toBeVisible();
});
```

### Testing Forms

```typescript
test('should submit form', async ({ page }) => {
  await page.goto('/contact');

  await page.fill('input[name="name"]', 'John Doe');
  await page.fill('input[name="email"]', 'john@example.com');
  await page.fill('textarea[name="message"]', 'Hello!');

  await page.click('button[type="submit"]');

  await expect(page.locator('.success-message')).toBeVisible();
});
```

## Configuration

Playwright configuration is in `playwright.config.ts` at the repository root.

### Key Settings

- **testDir**: `./apps/web/tests/e2e` - Where test files are located
- **webServer**: Automatically starts the Next.js dev server before tests (120s timeout)
- **baseURL**: `http://localhost:3000` - Base URL for navigation
- **retries**: 2 on CI, 0 locally - Retry flaky tests on CI

### Troubleshooting

#### Tests Hang or Timeout

If `bun run test:e2e` hangs indefinitely:

1. **Check if dev server starts**: Run `bun run --filter=@ui-designer/web dev` manually to verify the server starts successfully
2. **Verify port 3000 is free**: Kill any processes using port 3000
3. **Check webServer timeout**: The config allows 120s for the server to start; increase if needed on slower machines
4. **Use existing server**: If the dev server is already running, Playwright will reuse it (unless in CI)

#### Tests Hang During Execution

If tests start but never complete (not a server startup issue), the most common causes are:

1. Unawaited async matchers: `expect.soft(locator).toBeVisible();` without `await` returns a Promise that can leave teardown waiting.
2. Awaiting the wrapper without a matcher: `await expect.soft(locator);` resolves immediately but never runs an assertion, leading to confusing passes or later hangs.
3. Matchers that never stabilize: e.g., `await expect.soft(page).toHaveURL(/never-matches/)` will retry until the expect timeout (5s in config by default) then fail.
4. Dangling async work: unawaited `page.waitFor*`, open websockets, or `setInterval` not cleared.

Fix:

- Always await async matchers
- Never await the wrapper alone
- Keep reasonable timeouts (configured in `playwright.config.ts`)
- Use `--debug`, tracing, or `DEBUG=pw:api` to pinpoint where the hang occurs

### Running Against Production

To test against a production build:

```bash
# Build the app
bun run build

# Start production server
bun run --filter=@ui-designer/web start

# In another terminal, run tests
# The Playwright config picks up PLAYWRIGHT_BASE_URL automatically
PLAYWRIGHT_BASE_URL=http://localhost:3000 bun run test:e2e
```

## Best Practices

### 1. Use Semantic Locators

Prefer role-based locators over CSS selectors:

```typescript
// ✅ Good
await page.getByRole('button', { name: 'Submit' });

// ❌ Bad
await page.locator('button.submit-btn');
```

### 2. Wait for Elements

Playwright auto-waits, but be explicit when needed:

```typescript
await page.waitForSelector('.loading', { state: 'hidden' });
await page.waitForLoadState('networkidle');
```

### 3. Use Test Fixtures

Create reusable setup:

```typescript
import { test as base } from '@playwright/test';

const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // Login logic
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await use(page);
  },
});
```

### 4. Isolate Tests

Each test should be independent:

```typescript
test.beforeEach(async ({ page }) => {
  // Reset state before each test
  await page.goto('/');
});
```

### 5. Use Screenshots and Videos

Capture failures for debugging:

```typescript
test('should work', async ({ page }) => {
  await page.goto('/');
  await page.screenshot({ path: 'screenshot.png' });
});
```

### 6. Wait for Hydration in SSR Apps

In Next.js (or any SSR) apps, some UI (e.g., Font Awesome icons) may not be immediately visible after navigation because React must hydrate the server-rendered HTML. Before asserting on dynamically rendered elements, first wait for a stable, explicit hydration marker in your app (e.g., `data-testid="app-root"`).

```ts
import { test, expect } from '@playwright/test';

test('icons visible after hydration', async ({ page }) => {
  await page.goto('/');

  // Prefer an explicit hydration marker in your app shell
  await expect(page.getByTestId('app-root')).toBeVisible();

  // Now assert on dynamic content rendered during/after hydration
  await expect(page.locator('svg[data-icon="coffee"]')).toBeVisible();
});
```

Common causes of delayed DOM during SSR hydration include: third-party libraries that inject DOM (e.g., Font Awesome, charting libraries), client components that initialize in useEffect, and dynamic imports that load after initial render. These are why an explicit hydration marker is preferable to hardcoded timeouts—it provides a reliable signal that the app is ready for interaction.

Note: `page.waitForLoadState('networkidle')` can be used with caution if hydration completion correlates with network idleness in your app. However, explicit markers are faster and more reliable.

This approach relies on Playwright's web-first assertions (auto-retry) and avoids brittle, hardcoded timeouts. It's especially important for client components and third-party libraries that inject DOM during hydration.

## Debugging

### Debug Mode

```bash
bunx playwright test --debug
```

Opens Playwright Inspector for step-by-step debugging.

### Trace Viewer

```bash
# Run with trace
bunx playwright test --trace on

# View trace
bunx playwright show-trace trace.zip
```

### Console Logs

```typescript
page.on('console', (msg) => console.log(msg.text()));
```

## CI Integration

Playwright tests run automatically in CI via `.github/workflows/ci.yml`.

The workflow:

1. Installs dependencies
2. Installs Playwright browsers
3. Runs tests
4. Uploads test reports as artifacts

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
