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
bunx playwright test apps/web/e2e/home.spec.ts

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

- **testDir**: `./apps/web/e2e` - Where test files are located
- **webServer**: Automatically starts the Next.js dev server before tests
- **baseURL**: `http://localhost:3000` - Base URL for navigation
- **retries**: 2 on CI, 0 locally - Retry flaky tests on CI

### Running Against Production

To test against a production build:

```bash
# Build the app
bun run build

# Start production server
bun run --filter=@ui-designer/web start

# In another terminal, run tests
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
