import baseConfig from '@romulus/eslint-config'
import tsParser from '@typescript-eslint/parser'
import svelte from 'eslint-plugin-svelte'
import globals from 'globals'
import svelteParser from 'svelte-eslint-parser'

import svelteConfig from './svelte.config.js'

export default [
  ...baseConfig,
  ...svelte.configs['flat/recommended'],
  ...svelte.configs['flat/prettier'],
  {
    files: ['**/*.svelte', '**/*.svelte.ts'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parser: svelteParser,
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: ['.svelte'],
        svelteConfig,
      },
    },
    settings: {
      svelte: {
        ignoreWarnings: [
          '@typescript-eslint/no-unsafe-member-access',
          '@typescript-eslint/no-unsafe-assignment',
          '@typescript-eslint/no-unsafe-argument',
          '@typescript-eslint/no-unsafe-return',
          '@typescript-eslint/no-unsafe-call',
        ],
      },
    },
  },
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parserOptions: {
        projectService: {
          allowDefaultProject: [
            'lint/returned-errors/src/*.js',
            'lint/returned-errors/src/rules/*.js',
          ],
          defaultProject: './tsconfig.json',
        },
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: ['.svelte'],
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    rules: {
      'svelte/button-has-type': ['error'],
    },
  },
  {
    files: ['**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-empty-function': 'off',
    },
  },
  {
    ignores: ['**/.DS_Store', 'node_modules', 'build', '.svelte-kit', 'package', 'coverage'],
  },
]
