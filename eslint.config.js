import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import nextPlugin from '@next/eslint-plugin-next';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';
import unicornPlugin from 'eslint-plugin-unicorn';
import drizzlePlugin from 'eslint-plugin-drizzle';
import sonarPlugin from 'eslint-plugin-sonarjs';

export default tseslint.config(
  // Base configs
  eslint.configs.recommended,
  // @ts-expect-error - typescript-eslint v8 config type compatibility
  ...tseslint.configs.recommendedTypeChecked,
  // @ts-expect-error - typescript-eslint v8 config type compatibility
  ...tseslint.configs.stylisticTypeChecked,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.eslint.json',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      unicorn: unicornPlugin,
    },
    rules: {
      // TypeScript rules (XO-inspired strictness)
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-confusing-void-expression': 'error',

      // Unicorn rules (XO's modern JavaScript patterns)
      'unicorn/better-regex': 'error',
      'unicorn/catch-error-name': 'error',
      'unicorn/consistent-destructuring': 'error',
      'unicorn/consistent-function-scoping': 'error',
      'unicorn/custom-error-definition': 'error',
      'unicorn/error-message': 'error',
      'unicorn/escape-case': 'error',
      'unicorn/expiring-todo-comments': 'warn',
      'unicorn/explicit-length-check': 'error',
      'unicorn/filename-case': [
        'error',
        {
          cases: {
            kebabCase: true,
            pascalCase: true,
          },
        },
      ],
      'unicorn/new-for-builtins': 'error',
      'unicorn/no-abusive-eslint-disable': 'error',
      'unicorn/no-array-push-push': 'error',
      'unicorn/no-console-spaces': 'error',
      'unicorn/no-for-loop': 'error',
      'unicorn/no-instanceof-array': 'error',
      'unicorn/no-invalid-remove-event-listener': 'error',
      'unicorn/no-lonely-if': 'error',
      'unicorn/no-negated-condition': 'error',
      'unicorn/no-nested-ternary': 'error',
      'unicorn/no-new-array': 'error',
      'unicorn/no-new-buffer': 'error',
      'unicorn/no-static-only-class': 'error',
      'unicorn/no-thenable': 'error',
      'unicorn/no-this-assignment': 'error',
      'unicorn/no-unnecessary-await': 'error',
      'unicorn/no-useless-fallback-in-spread': 'error',
      'unicorn/no-useless-length-check': 'error',
      'unicorn/no-useless-promise-resolve-reject': 'error',
      'unicorn/no-useless-spread': 'error',
      'unicorn/no-useless-switch-case': 'error',
      'unicorn/no-zero-fractions': 'error',
      'unicorn/number-literal-case': 'error',
      'unicorn/numeric-separators-style': 'error',
      'unicorn/prefer-add-event-listener': 'error',
      'unicorn/prefer-array-find': 'error',
      'unicorn/prefer-array-flat': 'error',
      'unicorn/prefer-array-flat-map': 'error',
      'unicorn/prefer-array-index-of': 'error',
      'unicorn/prefer-array-some': 'error',
      'unicorn/prefer-at': 'error',
      'unicorn/prefer-code-point': 'error',
      'unicorn/prefer-date-now': 'error',
      'unicorn/prefer-default-parameters': 'error',
      'unicorn/prefer-dom-node-append': 'error',
      'unicorn/prefer-dom-node-dataset': 'error',
      'unicorn/prefer-dom-node-remove': 'error',
      'unicorn/prefer-dom-node-text-content': 'error',
      'unicorn/prefer-includes': 'error',
      'unicorn/prefer-keyboard-event-key': 'error',
      'unicorn/prefer-math-trunc': 'error',
      'unicorn/prefer-modern-dom-apis': 'error',
      'unicorn/prefer-modern-math-apis': 'error',
      'unicorn/prefer-native-coercion-functions': 'error',
      'unicorn/prefer-negative-index': 'error',
      'unicorn/prefer-node-protocol': 'error',
      'unicorn/prefer-number-properties': 'error',
      'unicorn/prefer-object-from-entries': 'error',
      'unicorn/prefer-prototype-methods': 'error',
      'unicorn/prefer-query-selector': 'error',
      'unicorn/prefer-reflect-apply': 'error',
      'unicorn/prefer-regexp-test': 'error',
      'unicorn/prefer-set-has': 'error',
      'unicorn/prefer-set-size': 'error',
      'unicorn/prefer-spread': 'error',
      'unicorn/prefer-string-replace-all': 'error',
      'unicorn/prefer-string-slice': 'error',
      'unicorn/prefer-string-starts-ends-with': 'error',
      'unicorn/prefer-string-trim-start-end': 'error',
      'unicorn/prefer-switch': 'error',
      'unicorn/prefer-ternary': 'error',
      'unicorn/prefer-type-error': 'error',
      'unicorn/require-array-join-separator': 'error',
      'unicorn/require-number-to-fixed-digits-argument': 'error',
      'unicorn/throw-new-error': 'error',

      // Unicorn rules to disable (too strict or not applicable)
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/no-null': 'off',
      'unicorn/prefer-module': 'off',
      'unicorn/prefer-top-level-await': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-array-for-each': 'off',
      'unicorn/no-array-callback-reference': 'off',

      // General code quality (XO-inspired)
      'no-warning-comments': ['warn', { terms: ['todo', 'fixme', 'hack'], location: 'start' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'prefer-arrow-callback': 'error',
      'prefer-template': 'error',
      'object-shorthand': ['error', 'always'],
      'no-useless-concat': 'error',
      'no-useless-return': 'error',
      'no-var': 'error',
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
    },
  },

  {
    // React-specific rules only for React files
    files: ['apps/**/*.{tsx,jsx}', '**/*.{tsx,jsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/jsx-no-target-blank': 'warn',
      'react/prop-types': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: ['apps/**/*.{ts,tsx}'],
    plugins: {
      // @ts-expect-error - Next.js plugin type compatibility with flat config
      '@next/next': nextPlugin,
    },
    rules: {
      // @ts-expect-error - Next.js plugin rules type compatibility
      ...nextPlugin.configs.recommended.rules,
      // @ts-expect-error - Next.js plugin rules type compatibility
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'jsx-a11y': jsxA11y,
      import: importPlugin,
    },
    rules: {
      // Accessibility rules
      ...jsxA11y.configs.recommended.rules,
      'jsx-a11y/anchor-is-valid': 'warn',

      // Import rules (XO-inspired organization)
      ...importPlugin.configs.recommended.rules,
      'import/no-unresolved': 'off',
      'import/no-cycle': ['error', { maxDepth: 1 }],
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling'],
            'index',
            'object',
            'type',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/first': 'error',
      'import/no-duplicates': 'error',
      'import/newline-after-import': 'error',
      'import/no-anonymous-default-export': 'warn',
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: ['./tsconfig.json', './apps/*/tsconfig.json', './packages/*/tsconfig.json'],
        },
      },
    },
  },
  {
    // Drizzle ORM rules
    files: ['**/*.{ts,tsx}'],
    plugins: {
      drizzle: drizzlePlugin,
    },
    rules: {
      'drizzle/enforce-delete-with-where': 'error',
      'drizzle/enforce-update-with-where': 'error',
    },
  },
  sonarPlugin.configs.recommended,
  // Prettier config (must be last to override formatting rules)
  ...(Array.isArray(prettierConfig) ? prettierConfig : [prettierConfig]),
  {
    // Plain JS utilities/scripts: disable TypeScript-specific rules
    files: ['scripts/**/*.js'],
    rules: {
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/consistent-type-exports': 'off',
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },
  {
    // Test files override: relax strict unsafe rules and import order constraints needed for mocks
    files: [
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/__tests__/**/*.{ts,tsx}',
    ],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'sonarjs/no-unused-vars': 'off',
      'import/first': 'off',
      // Prefer soft assertions in tests across Vitest and Playwright
      // See docs/testing-guide.md for patterns and async matcher guidance.
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'CallExpression[callee.name="expect"]:not(:has(MemberExpression[property.name=/^(assertions|hasAssertions)$/]))',
          message:
            'Use expect.soft(...) instead of expect(...). See docs/testing-guide.md for guidance.',
        },
        // Playwright anti-pattern: awaiting the wrapper without a matcher
        // Disallow: await expect.soft(locator)
        // Prefer: await expect.soft(locator).toBeVisible() or const v = await fn(); expect.soft(v).toBe(...)
        {
          selector:
            'AwaitExpression > CallExpression[callee.object.name="expect"][callee.property.name="soft"]',
          message:
            'Do not await expect.soft(...) without a matcher. Use: await expect.soft(locator).toBeVisible() or const value = await fn(); expect.soft(value).toBe(...)',
        },
        // Playwright anti-pattern: calling the wrapper without a matcher
        // Disallow: expect.soft(locator);
        // Prefer: await expect.soft(locator).toBeVisible() or const v = await fn(); expect.soft(v).toBe(...)
        {
          selector:
            'ExpressionStatement > CallExpression[callee.object.name="expect"][callee.property.name="soft"]',
          message:
            'Do not call expect.soft(...) without a matcher. Use await expect.soft(locator).toBeVisible() or await fn(); expect.soft(value).toBe(...)',
        },
      ],
    },
  },
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.next/**',
      '.bun-cache/',
      '.vscode/',
      '.idea/',
      '.scannerwork/',
      'plans/',
      'examples/',
      'commitlint.config.js',
      'eslint.config.js',
      '**/postcss.config.*',
      'stylelint.config.mjs',
      '**/vitest.config.ts',
      '**/vitest.setup.ts',
      'test/**',
      '**/*.d.ts',
      '**/*.tsbuildinfo',
      '**/next.config.*',
      '**/next-env.d.ts',
    ],
  }
);
