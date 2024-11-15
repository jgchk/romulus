import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils'
import * as ts from 'typescript'

import { createRule } from '../utils.js'

/**
 * @typedef {import('@typescript-eslint/utils').TSESTree.Node} TSESTreeNode
 * @typedef {import('@typescript-eslint/utils').TSESTree.CallExpression} CallExpression
 * @typedef {import('@typescript-eslint/utils').TSESTree.Identifier} TSESTreeIdentifier
 */

export const rule = createRule({
  create(context) {
    const services = ESLintUtils.getParserServices(context)
    const checker = services.program.getTypeChecker()

    class TypeChecker {
      /**
       * @param {ts.Type} type
       * @returns {boolean}
       */
      static isErrorType(type) {
        if (type.symbol?.escapedName?.toString() === 'Error') return true
        if (type.isUnion()) return type.types.some((type) => TypeChecker.isErrorType(type))

        const symbol = type.getSymbol()
        if (!symbol?.getDeclarations()) return false

        return !!symbol.getDeclarations()?.some((declaration) => {
          if (!ts.isClassDeclaration(declaration)) return false
          return (
            declaration.heritageClauses?.some((clause) =>
              clause.types.some((t) => TypeChecker.isErrorType(checker.getTypeFromTypeNode(t))),
            ) ?? false
          )
        })
      }

      /**
       * @param {ts.Type} type
       * @returns {Set<string>}
       */
      static getErrorTypes(type) {
        /** @type {Set<string>} */
        const types = new Set()

        if (type.symbol?.escapedName === 'Promise') {
          const typeArgs = checker.getTypeArguments(type)

          if (typeArgs[0]?.isUnion()) {
            for (const t of typeArgs[0].types) {
              if (TypeChecker.isErrorType(t)) {
                const name = t.symbol?.escapedName?.toString()
                if (name) types.add(name)
              }
            }
          } else {
            if (TypeChecker.isErrorType(typeArgs[0])) {
              const name = typeArgs[0].symbol?.escapedName?.toString()
              if (name) types.add(name)
            }
          }
        } else if (type.isUnion()) {
          type.types.forEach((t) => {
            if (TypeChecker.isErrorType(t)) {
              const name = t.symbol?.escapedName?.toString()
              if (name) types.add(name)
            }
          })
        } else if (TypeChecker.isErrorType(type)) {
          const name = type.symbol?.escapedName?.toString()
          if (name) types.add(name)
        }

        return types
      }

      /**
       * @param {ts.Type} type
       * @returns {boolean}
       */
      static containsErrorType(type) {
        if (type.symbol?.escapedName === 'Promise') {
          const typeArguments = checker.getTypeArguments(type)
          return typeArguments.length > 0 && typeArguments.some(TypeChecker.isErrorType)
        }
        return TypeChecker.isErrorType(type)
      }
    }

    class NodeChecker {
      /**
       * @param {TSESTreeNode} node
       * @returns {boolean}
       */
      static isWithinExpectCall(node) {
        return (
          NodeChecker.findParent(
            node,
            (n) =>
              n.type === AST_NODE_TYPES.CallExpression &&
              n.callee.type === AST_NODE_TYPES.Identifier &&
              n.callee.name === 'expect',
          ) !== undefined
        )
      }

      /**
       * @param {TSESTreeNode} node
       * @param {(node: TSESTreeNode) => boolean} predicate
       * @returns {TSESTreeNode | undefined}
       */
      static findParent(node, predicate) {
        let current = node.parent
        while (current) {
          if (predicate(current)) return current
          current = current.parent
        }
      }

      /**
       * @param {TSESTreeNode} node
       * @returns {boolean}
       */
      static isInTruthyCheck(node) {
        const parent = node.parent
        return (
          (parent?.type === AST_NODE_TYPES.IfStatement && parent.test === node) ||
          (parent?.type === AST_NODE_TYPES.LogicalExpression &&
            parent.operator === '&&' &&
            parent.left === node) ||
          (parent?.type === AST_NODE_TYPES.ConditionalExpression && parent.test === node)
        )
      }

      /**
       * @param {TSESTreeNode} node
       * @returns {boolean}
       */
      static isWithinReturnStatement(node) {
        return (
          NodeChecker.findParent(node, (n) => n.type === AST_NODE_TYPES.ReturnStatement) !==
          undefined
        )
      }

      /**
       * @param {TSESTreeNode} node
       * @returns {boolean}
       */
      static isErrorOrUndefined(node) {
        const tsNode = services.esTreeNodeToTSNodeMap.get(node)
        const type = checker.getTypeAtLocation(tsNode)

        if (type.isUnion()) {
          const hasError = type.types.some((t) => TypeChecker.isErrorType(t))
          const hasUndefined = type.types.some((t) => t.flags & ts.TypeFlags.Undefined)
          return hasError && hasUndefined
        }

        return false
      }
    }

    /**
     * @param {CallExpression} node
     */
    function handleCallExpression(node) {
      if (isSuperCallInErrorConstructor(node)) return

      const tsNode = services.esTreeNodeToTSNodeMap.get(node)
      if (!returnsError(tsNode)) return

      if (NodeChecker.isWithinReturnStatement(node) && parentFunctionReturnsError(node)) return

      const resultIdentifier = getErrorResultVariableIdentifier(tsNode)
      if (!resultIdentifier || !checksErrorResult(node, resultIdentifier)) {
        context.report({
          node,
          messageId: 'enforceErrorHandling',
        })
      }
    }

    /**
     * @param {CallExpression} node
     * @returns {boolean}
     */
    function isSuperCallInErrorConstructor(node) {
      if (node.callee.type !== AST_NODE_TYPES.Super) return false

      const classDeclaration = NodeChecker.findParent(
        node,
        (n) => n.type === AST_NODE_TYPES.ClassDeclaration,
      )

      if (classDeclaration) {
        const tsNode = services.esTreeNodeToTSNodeMap.get(classDeclaration)
        const type = checker.getTypeAtLocation(tsNode)
        return TypeChecker.isErrorType(type)
      }

      return false
    }

    /**
     * @param {ts.CallExpression} tsNode
     * @returns {boolean}
     */
    function returnsError(tsNode) {
      const signature = checker.getResolvedSignature(tsNode)
      if (!signature) return false

      const returnType = checker.getReturnTypeOfSignature(signature)
      return TypeChecker.containsErrorType(returnType)
    }

    /**
     * @param {CallExpression} node
     * @returns {boolean}
     */
    function parentFunctionReturnsError(node) {
      const functionNode = NodeChecker.findParent(
        node,
        (n) =>
          n.type === AST_NODE_TYPES.FunctionDeclaration ||
          n.type === AST_NODE_TYPES.FunctionExpression ||
          n.type === AST_NODE_TYPES.ArrowFunctionExpression,
      )

      if (functionNode) {
        const tsNode = services.esTreeNodeToTSNodeMap.get(functionNode)
        const signature = checker.getSignatureFromDeclaration(tsNode)
        if (signature) {
          const returnType = checker.getReturnTypeOfSignature(signature)
          return TypeChecker.containsErrorType(returnType)
        }
      }

      return false
    }

    /**
     * @param {ts.CallExpression} tsNode
     * @returns {ts.Identifier | undefined}
     */
    function getErrorResultVariableIdentifier(tsNode) {
      let current = tsNode.parent

      while (ts.isConditionalExpression(current)) {
        current = current.parent
      }

      if (ts.isVariableDeclaration(current) && ts.isIdentifier(current.name)) {
        return current.name
      }

      if (
        ts.isAwaitExpression(current) &&
        ts.isVariableDeclaration(current.parent) &&
        ts.isIdentifier(current.parent.name)
      ) {
        return current.parent.name
      }

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
     * @param {CallExpression} node
     * @param {ts.Identifier} resultIdentifier
     * @returns {boolean}
     */
    function checksErrorResult(node, resultIdentifier) {
      const scope = context.sourceCode.getScope(node)
      const resultIdentifiers = scope.references
        .map((ref) => {
          const identifier = ref.identifier
          if (identifier.type !== AST_NODE_TYPES.Identifier) return
          if (identifier.name !== resultIdentifier.getText()) return
          return identifier
        })
        .filter((i) => i !== undefined)

      const originalCallNode = services.esTreeNodeToTSNodeMap.get(node)
      const returnType = checker.getReturnTypeOfSignature(
        checker.getResolvedSignature(originalCallNode),
      )
      const possibleErrorTypes = TypeChecker.getErrorTypes(returnType)
      const checkedErrorTypes = new Set()

      for (const refId of resultIdentifiers) {
        if (NodeChecker.isWithinExpectCall(refId)) return true
        if (NodeChecker.isInTruthyCheck(refId) && NodeChecker.isErrorOrUndefined(refId)) return true

        // Check instanceof checks
        const instanceofCheck = NodeChecker.findParent(
          refId,
          (n) =>
            n.type === AST_NODE_TYPES.BinaryExpression &&
            n.operator === 'instanceof' &&
            n.left === refId &&
            n.right.type === AST_NODE_TYPES.Identifier,
        )

        if (instanceofCheck) {
          const rightTsNode = services.esTreeNodeToTSNodeMap.get(instanceofCheck.right)
          const rightType = checker.getTypeAtLocation(rightTsNode)
          const typeName = rightType.symbol?.escapedName?.toString()
          if (typeName) {
            checkedErrorTypes.add(typeName)
          }

          const ifStatement = NodeChecker.findParent(
            instanceofCheck,
            (n) => n.type === AST_NODE_TYPES.IfStatement,
          )

          if (ifStatement?.alternate) {
            const remainingTypes = new Set(possibleErrorTypes)
            checkedErrorTypes.forEach((t) => remainingTypes.delete(t))
            if (remainingTypes.size === 0) return true
          }
        }
      }

      return possibleErrorTypes.size === checkedErrorTypes.size
    }

    return {
      CallExpression: handleCallExpression,
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
