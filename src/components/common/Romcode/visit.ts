import { Node, Parent, Root } from './types'

export type Visitor = (
  node: Node,
  index: number | undefined,
  parent: Parent | undefined
) => void

const visitParents = (
  root: Root,
  visitor: (node: Node, ancestors: Parent[]) => void
) => {
  const factory = (node: Node, parents: Parent[]) => {
    visitor(node, parents)

    if ('children' in node) {
      let offset = 0
      const grandparents = [...parents, node]

      while (offset < node.children.length) {
        factory(node.children[offset], grandparents)
        offset += 1
      }
    }
  }

  factory(root, [])
}

export const visit = (root: Root, visitor: Visitor) => {
  const overload = (node: Node, parents: Parent[]) => {
    const parent = parents[parents.length - 1]
    return visitor(
      node,
      parent && 'children' in parent
        ? (parent.children as Node[]).indexOf(node)
        : undefined,
      parent
    )
  }

  visitParents(root, overload)
}
