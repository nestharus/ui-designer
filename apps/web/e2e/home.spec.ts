import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load and display the main heading', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h1')).toContainText('UI Designer');
  });

  test('should display Font Awesome icons', async ({ page }) => {
    await page.goto('/');

    // Check that specific SVG icons are rendered
    await expect(page.locator('svg[data-icon="rocket"]')).toBeVisible();
    await expect(page.locator('svg[data-icon="coffee"]')).toBeVisible();
    await expect(page.locator('svg[data-icon="github"]')).toBeVisible();
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/UI Designer/);
  });

  test('should be responsive', async ({ page }) => {
    await page.goto('/');

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('main')).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('main')).toBeVisible();
  });
});
