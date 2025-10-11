// Pattern: await expect.soft(locator).matcher() for Playwright assertions
import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load and display the main heading', async ({ page }) => {
    await page.goto('/');

    await expect.soft(page.locator('h1')).toContainText('UI Designer');
  });

  test('should display Font Awesome icons', async ({ page }) => {
    await page.goto('/');

    // Wait for hydration using explicit app marker
    await expect.soft(page.getByTestId('app-root')).toBeVisible();

    // Check that specific SVG icons are rendered
    await expect.soft(page.locator('svg[data-icon="rocket"]')).toBeVisible();
    // Font Awesome v6+ renamed "coffee" to "mug-saucer"; accept either
    const coffeeOrMug = page.locator('svg[data-icon="coffee"], svg[data-icon="mug-saucer"]');
    await expect.soft(coffeeOrMug).toBeVisible();
    await expect.soft(page.locator('svg[data-icon="github"]')).toBeVisible();
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/');

    await expect.soft(page).toHaveTitle(/UI Designer/);
  });

  test('should be responsive', async ({ page }) => {
    await page.goto('/');

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect.soft(page.getByRole('heading', { level: 1, name: /ui designer/i })).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect.soft(page.getByRole('heading', { level: 1, name: /ui designer/i })).toBeVisible();
  });
});
