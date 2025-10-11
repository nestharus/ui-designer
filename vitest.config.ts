import { defineConfig } from 'vitest/config';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sharedTypesSrc = resolve(__dirname, 'packages/shared-types/src');

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['packages/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/.bun-cache/**', 'test/**'],
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
        perFile: false,
      },
      include: ['packages/**/src/**'],
      exclude: [
        'node_modules/',
        'dist/',
        'test/**',
        '**/*.config.{ts,js,mjs}',
        '**/*.d.ts',
        '**/types/**',
        '**/__tests__/**',
        // Exclude only verified barrel/re-export index files
        'packages/shared-types/src/index.ts',
      ],
    },
    setupFiles: ['./test/setup.ts'],
  },
  resolve: {
    alias: {
      '@ui-designer/shared-types': sharedTypesSrc,
    },
  },
});
