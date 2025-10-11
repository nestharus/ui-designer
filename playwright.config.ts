import { defineConfig, devices } from '@playwright/test';
import type { PlaywrightTestConfig } from '@playwright/test';
import * as process from "node:process";

const config: PlaywrightTestConfig = {
  testDir: './apps/web/tests/e2e',
  timeout: 120_000,
  fullyParallel: !process.env.CI,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Opt out of full parallelism on CI; limited parallelism keeps wall time reasonable across 3 browsers
  // Tune based on observed runtime: raise to 2–3 workers if needed, or increase CI timeout.
  ...(process.env.CI ? { workers: 1 } : {}),
  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
    ['github']
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000',
    actionTimeout: 20_000,
    navigationTimeout: 60_000,
    trace: 'retain-on-failure',
  },
  expect: {
    timeout: 10_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'bun run --filter=@ui-designer/web dev',
    port: 3000,
    reuseExistingServer: true,
    timeout: 120_000,
    env: {
      HOST: '127.0.0.1',
      PORT: '3000',
    },
  },
};

export default defineConfig(config);
