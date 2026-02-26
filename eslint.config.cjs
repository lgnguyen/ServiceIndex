// ESLint flat config for ESLint v10+
// TypeScript-only linting using @typescript-eslint.

const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');

module.exports = [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      // Start from the plugin's recommended rules
      ...tsPlugin.configs.recommended.rules,

      // Project-specific style rules from the old .eslintrc.json
      indent: ['error', 4],
      'linebreak-style': ['error', 'unix'],
      quotes: ['error', 'double'],
      semi: ['error', 'always'],
    },
  },
];
  