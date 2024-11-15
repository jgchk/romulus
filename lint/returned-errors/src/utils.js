import { ESLintUtils } from '@typescript-eslint/utils'

/**
 * @typedef {Object} ExampleTypedLintingRuleDocs
 * @property {string} description - The description of the linting rule
 * @property {boolean} [recommended] - Whether the rule is recommended or not
 * @property {boolean} [requiresTypeChecking] - Whether the rule requires type checking
 */

/** @type {<Options extends readonly unknown[], MessageIds extends string>({ meta, name, ...rule }: Readonly<import('@typescript-eslint/utils/eslint-utils').RuleWithMetaAndName<Options, MessageIds, ExampleTypedLintingRuleDocs>>) => import('@typescript-eslint/utils/ts-eslint').RuleModule<MessageIds, Options, ExampleTypedLintingRuleDocs>} **/
export const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/typescript-eslint/examples/tree/main/eslint-plugin-example-typed-linting/docs/${name}.md`,
)
