/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard', 'stylelint-config-prettier'],
  rules: {
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['source', 'theme', 'utility', 'import', 'plugin']
      }
    ],
    'function-no-unknown': [
      true,
      {
        ignoreFunctions: ['theme']
      }
    ],
    // Allow Tailwind v4 import syntax
    'import-notation': null,
    // Allow both short and long hex colors
    'color-hex-length': null,
    // Allow decimal alpha values (e.g., 0.1 instead of 10%)
    'alpha-value-notation': null,
    // Allow font family names with capitals
    'value-keyword-case': null
  }
};
