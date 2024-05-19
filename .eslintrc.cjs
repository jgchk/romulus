/** @type { import("eslint").Linter.Config } */
module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:svelte/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'simple-import-sort'],
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
    sourceType: 'module',
    ecmaVersion: 2020,
    extraFileExtensions: ['.svelte'],
  },
  env: {
    browser: true,
    es2017: true,
    node: true,
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
  overrides: [
    {
      files: ['*.svelte'],
      parser: 'svelte-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
      globals: {
        $$Generic: 'readonly',
      },
    },
  ],
  rules: {
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
  },
}
