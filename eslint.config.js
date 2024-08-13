import eslint from '@eslint/js'
import tsParser from '@typescript-eslint/parser'
import prettier from 'eslint-config-prettier'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import svelte from 'eslint-plugin-svelte'
import globals from 'globals'
import svelteParser from 'svelte-eslint-parser'
import tseslint from 'typescript-eslint'

import svelteConfig from './svelte.config.js'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  // ...tseslint.configs.stylisticTypeChecked,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  ...svelte.configs['flat/recommended'],
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  ...svelte.configs['flat/prettier'],
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
          '@typescript-eslint/restrict-template-expressions',
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
            'eslint.config.js',
            'postcss.config.js',
            'svelte.config.js',
            'drizzle.config.ts',
            'playwright.config.ts',
            'tailwind.config.ts',
            'vitest.config.ts',
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
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
  { ignores: ['**/.DS_Store', 'node_modules', 'build', '.svelte-kit', 'package', 'coverage'] },
  {
    rules: {
      '@typescript-eslint/unbound-method': 'off',
    },
  },
)
