import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils'
import * as ts from 'typescript'

import { createRule } from '../utils.js'

export const rule = createRule({
  create(context) {
    const services = ESLintUtils.getParserServices(context)
    const checker = services.program.getTypeChecker()

    /** @type {ESLintUtils.RuleListener} */
    const ruleListener = {
      CallExpression(node) {
        handleCallExpression(node)
      },
    }

    /**
     * @param {import('@typescript-eslint/utils').TSESTree.CallExpression} node
     */
    function handleCallExpression(node) {
      if (isSuperCallInErrorConstructor(node)) {
        return
      }

      const tsNode = services.esTreeNodeToTSNodeMap.get(node)
      if (!returnsError(tsNode)) {
        return
      }

      if (isWithinReturnStatement(node) && parentFunctionReturnsError(node)) {
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
    }

    /**
     * Checks if a node is a super() call inside a custom error constructor
     * @param {import('@typescript-eslint/utils').TSESTree.CallExpression} node
     * @returns {boolean}
     */
    function isSuperCallInErrorConstructor(node) {
      if (node.callee.type !== AST_NODE_TYPES.Super) return false

      /** @type {import('@typescript-eslint/utils').TSESTree.Node | undefined} **/
      let parent = node.parent
      while (parent) {
        if (parent.type === AST_NODE_TYPES.ClassDeclaration) {
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
     * @param {import('@typescript-eslint/utils').TSESTree.CallExpression} node
     */
    function isWithinReturnStatement(node) {
      /** @type {import('@typescript-eslint/utils').TSESTree.Node | undefined} **/
      let current = node.parent
      while (current) {
        if (current.type === AST_NODE_TYPES.ReturnStatement) {
          return true
        }
        current = current.parent
      }
      return false
    }

    /**
     * @param {import('@typescript-eslint/utils').TSESTree.CallExpression} node
     */
    function parentFunctionReturnsError(node) {
      /** @type {import('@typescript-eslint/utils').TSESTree.Node | undefined} **/
      let current = node.parent
      while (current) {
        if (
          current.type === AST_NODE_TYPES.FunctionDeclaration ||
          current.type === AST_NODE_TYPES.FunctionExpression ||
          current.type === AST_NODE_TYPES.ArrowFunctionExpression
        ) {
          const tsNode = services.esTreeNodeToTSNodeMap.get(current)
          const signature = checker.getSignatureFromDeclaration(tsNode)
          if (signature) {
            const returnType = checker.getReturnTypeOfSignature(signature)
            return containsErrorType(returnType)
          }
        }
        current = current.parent
      }
      return false
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
     * @param {import('@typescript-eslint/utils').TSESTree.Node} node
     * @param {ts.Identifier} resultIdentifier
     */
    function checksErrorResult(node, resultIdentifier) {
      const scope = context.sourceCode.getScope(node)
      const resultAssignmentReferences = scope.references.filter(
        (ref) =>
          ref.identifier.type === AST_NODE_TYPES.Identifier &&
          ref.identifier.name === resultIdentifier.getText(),
      )

      return resultAssignmentReferences.some((ref) => {
        if (isInInstanceOfCheck(ref.identifier)) {
          return true
        }

        if (isWithinExpectCall(ref.identifier)) {
          return true
        }

        return false
      })
    }

    /**
     * @param {import('@typescript-eslint/utils').TSESTree.Node} node
     * @returns {boolean}
     */
    function isInInstanceOfCheck(node) {
      return (
        node.parent?.type === AST_NODE_TYPES.BinaryExpression &&
        node.parent.operator === 'instanceof'
      )
    }

    /**
     * Checks if a node is within an expect(...) call
     * @param {import('@typescript-eslint/utils').TSESTree.Node} node
     * @returns {boolean}
     */
    function isWithinExpectCall(node) {
      let current = node.parent
      while (current) {
        if (
          current.type === AST_NODE_TYPES.CallExpression &&
          current.callee.type === AST_NODE_TYPES.Identifier &&
          current.callee.name === 'expect'
        ) {
          return true
        }
        current = current.parent
      }
      return false
    }

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

    return ruleListener
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
