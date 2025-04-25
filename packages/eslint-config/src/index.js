import eslint from '@eslint/js'
import prettier from 'eslint-config-prettier'
import errorHandlingPlugin from 'eslint-plugin-returned-errors'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import tseslint from 'typescript-eslint'
import importPlugin from 'eslint-plugin-import'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  errorHandlingPlugin.configs.recommended,
  prettier,
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
    plugins: {
      import: importPlugin,
    },
    rules: {
      'import/consistent-type-specifier-style': ['error', 'prefer-inline'],
    },
  },
  {
    rules: {
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { disallowTypeAnnotations: false, fixStyle: 'inline-type-imports' },
      ],
    },
  },
)
