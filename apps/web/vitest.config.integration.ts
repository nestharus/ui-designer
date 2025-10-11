import { defineConfig } from 'vitest/config';

import base from './vitest.config';

export default defineConfig({
  ...base,
  test: {
    ...base.test,
    include: ['tests/integration/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      thresholds: {
        branches: 0,
        functions: 0,
        lines: 0,
        statements: 0,
        perFile: false,
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
      ],
    },
  },
});
