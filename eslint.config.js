import eslint from '@eslint/js'
import tsParser from '@typescript-eslint/parser'
import prettier from 'eslint-config-prettier'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import svelte from 'eslint-plugin-svelte'
import globals from 'globals'
import svelteParser from 'svelte-eslint-parser'
import tseslint from 'typescript-eslint'

import errorHandlingPlugin from './lint/returned-errors/src/index.js'
import svelteConfig from './svelte.config.js'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  ...svelte.configs['flat/recommended'],
  ...svelte.configs['flat/prettier'],
  errorHandlingPlugin.configs.recommended,
  prettier,
  {
    files: ['**/*.svelte'],
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
          allowDefaultProject: [],
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
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
  {
    rules: {
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/consistent-type-imports': ['error', { disallowTypeAnnotations: false }],
      'svelte/button-has-type': ['error'],
    },
  },
  { ignores: ['**/.DS_Store', 'node_modules', 'build', '.svelte-kit', 'package', 'coverage'] },
)
