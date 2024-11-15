import { ESLintUtils, TSESTree } from '@typescript-eslint/utils'
import * as ts from 'typescript'

import { createRule } from '../utils.js'

export const rule = createRule({
  create(context) {
    const services = ESLintUtils.getParserServices(context)
    const checker = services.program.getTypeChecker()

    /**
     * @param {ts.Type} type
     * @returns {boolean}
     */
    function isErrorType(type) {
      if (type.symbol?.escapedName === 'Error') {
        return true
      }

      if (type.isUnion()) {
        return type.types.some((t) => isErrorType(t))
      }

      const symbol = type.getSymbol()
      if (!symbol) return false

      const declarations = symbol.getDeclarations()
      if (!declarations) return false

      for (const declaration of declarations) {
        if (ts.isClassDeclaration(declaration)) {
          const heritage = declaration.heritageClauses
          if (!heritage) continue

          for (const clause of heritage) {
            for (const t of clause.types) {
              const baseType = checker.getTypeFromTypeNode(t)
              if (isErrorType(baseType)) {
                return true
              }
            }
          }
        }
      }

      return false
    }

    /**
     * @param {ts.Type} type
     * @returns {boolean}
     */
    function containsErrorType(type) {
      if (type.symbol?.escapedName === 'Promise') {
        // @ts-ignore
        const typeArguments = checker.getTypeArguments(type)
        if (typeArguments.length > 0) {
          return typeArguments.some(isErrorType)
        }
      }

      return isErrorType(type)
    }

    /**
     * @param {ts.CallExpression} tsNode
     * @returns {ts.Identifier | undefined}
     */
    function getErrorResultVariableIdentifier(tsNode) {
      let current = tsNode.parent

      // Handle conditional (ternary) expressions
      while (ts.isConditionalExpression(current)) {
        current = current.parent
      }

      // const a = b()
      if (ts.isVariableDeclaration(current) && ts.isIdentifier(current.name)) {
        return current.name
      }

      // const a = await b()
      if (
        ts.isAwaitExpression(current) &&
        ts.isVariableDeclaration(current.parent) &&
        ts.isIdentifier(current.parent.name)
      ) {
        return current.parent.name
      }

      // Handle binary expressions within variable declarations
      if (ts.isBinaryExpression(current)) {
        let parent = current.parent
        while (parent && !ts.isVariableDeclaration(parent)) {
          parent = parent.parent
        }
        if (parent && ts.isVariableDeclaration(parent) && ts.isIdentifier(parent.name)) {
          return parent.name
        }
      }
    }

    /**
     * Checks if a node is a super() call inside a custom error constructor
     * @param {import('@typescript-eslint/utils').TSESTree.CallExpression} node
     * @returns {boolean}
     */
    function isSuperCallInErrorConstructor(node) {
      if (node.callee.type !== 'Super') return false

      /** @type {TSESTree.Node | undefined} **/
      let parent = node.parent
      while (parent) {
        if (parent.type === 'ClassDeclaration') {
          const tsNode = services.esTreeNodeToTSNodeMap.get(parent)
          const type = checker.getTypeAtLocation(tsNode)
          return isErrorType(type)
        }
        parent = parent.parent
      }
      return false
    }

    /**
     * @param {ts.CallExpression} tsNode
     */
    function returnsError(tsNode) {
      const signature = checker.getResolvedSignature(tsNode)
      if (!signature) return

      const returnType = checker.getReturnTypeOfSignature(signature)

      return containsErrorType(returnType)
    }

    /**
     * @param {TSESTree.Node} node
     * @param {ts.Identifier} resultIdentifier
     */
    function checksErrorResult(node, resultIdentifier) {
      const scope = context.sourceCode.getScope(node)
      const resultAssignmentReferences = scope.references.filter(
        (ref) =>
          ref.identifier.type === 'Identifier' &&
          ref.identifier.name === resultIdentifier.getText(),
      )
      return resultAssignmentReferences.some((ref) => {
        return (
          ref.identifier.parent.type === 'BinaryExpression' &&
          ref.identifier.parent.operator === 'instanceof'
        )
      })
    }

    return {
      CallExpression(node) {
        if (isSuperCallInErrorConstructor(node)) {
          return
        }

        const tsNode = services.esTreeNodeToTSNodeMap.get(node)
        if (!returnsError(tsNode)) {
          return
        }

        const resultIdentifier = getErrorResultVariableIdentifier(tsNode)
        if (!resultIdentifier) {
          return context.report({
            node,
            messageId: 'enforceErrorHandling',
          })
        }

        if (!checksErrorResult(node, resultIdentifier)) {
          return context.report({
            node,
            messageId: 'enforceErrorHandling',
          })
        }
      },
    }
  },
  meta: {
    docs: {
      description: 'Require handling returned errors.',
      recommended: true,
      requiresTypeChecking: true,
    },
    messages: {
      enforceErrorHandling: 'You must handle returned errors.',
    },
    type: 'problem',
    schema: [],
  },
  name: 'enforce-error-handling',
  defaultOptions: [],
})
