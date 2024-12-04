import { rules } from './rules/index.js'

const plugin = {
  configs: {
    get recommended() {
      return recommended
    },
  },
  meta: { name: 'returned-errors' },
  rules,
}

/** @type {import('typescript-eslint').ConfigWithExtends} **/
const recommended = {
  plugins: {
    'returned-errors': plugin,
  },
  rules: {
    'returned-errors/enforce-error-handling': 'error',
  },
}

export default plugin
