import { defineConfig } from 'vitest/config';

import base from './vitest.config';

export default defineConfig({
  ...base,
  test: {
    ...base.test,
    include: [
      'app/**/*.{test,spec}.{ts,tsx}',
      'features/**/*.{test,spec}.{ts,tsx}',
      'lib/**/*.{test,spec}.{ts,tsx}',
      'hooks/**/*.{test,spec}.{ts,tsx}',
      'store/**/*.{test,spec}.{ts,tsx}',
      'server/**/*.{test,spec}.{ts,tsx}',
    ],
    exclude: ['tests/integration/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      thresholds: {
        branches: 100,
        functions: 100,
        lines: 100,
        statements: 100,
        perFile: true,
      },
      include: [
        'app/**/*.{ts,tsx}',
        'features/**/*.{ts,tsx}',
        'lib/**/*.{ts,tsx}',
        'hooks/**/*.{ts,tsx}',
        'store/**/*.{ts,tsx}',
        'server/**/*.{ts,tsx}',
      ],
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/*.d.ts',
        '**/types/**',
        '**/index.ts',
        'vitest.config.ts',
        'vitest.setup.ts',
        '../../packages/shared-types/**',
        'tests/integration/**',
      ],
    },
  },
});
