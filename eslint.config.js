import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2022,
      },
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'no-console': 'warn',
      // TypeScript handles unused vars better than ESLint
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // Allow 'any' in test files and for legacy casts
      '@typescript-eslint/no-explicit-any': 'warn',
      // Allow non-null assertions (used deliberately in the codebase)
      '@typescript-eslint/no-non-null-assertion': 'off',
      // Allow require() in config files
      '@typescript-eslint/no-require-imports': 'off',
      // Intentional pattern: redirect to valid tab when current tab becomes unavailable
      'react-hooks/set-state-in-effect': 'off',
      // Legacy analytics.ts uses arguments object (GA snippet)
      'prefer-rest-params': 'off',
    },
  },
  {
    files: ['src/**/*.test.{js,jsx,ts,tsx}', 'e2e/**/*.spec.{js,ts}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2022,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  prettier,
);
