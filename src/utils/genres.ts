import { TreeStructure } from '../server/db/genre/outputs'

export const makeGenreTag = (id: number) => `[Genre${id}]`

export type TreeSearchNode = {
  id: number
  path: number[]
}

export const treeDfs = (
  tree: Map<number, TreeStructure>,
  fn: (node: TreeSearchNode) => boolean
) => {
  const queue: TreeSearchNode[] = [...tree.values()]
    .filter((g) => g.parentGenres.length === 0)
    .map((g) => ({
      id: g.id,
      path: [g.id],
    }))

  let currentNode = queue.shift()
  while (currentNode !== undefined) {
    const { id, path } = currentNode

    if (fn(currentNode)) {
      return currentNode
    } else {
      const currentGenre = tree.get(id)
      if (currentGenre) {
        queue.push(
          ...currentGenre.childGenres.map((g) => ({
            id: g.id,
            path: [...path, g.id],
          }))
        )
      }
      currentNode = queue.shift()
    }
  }
}

export const treeBfs = (
  tree: Map<number, TreeStructure>,
  fn: (node: TreeSearchNode) => boolean
) => {
  const stack: TreeSearchNode[] = [...tree.values()]
    .filter((g) => g.parentGenres.length === 0)
    .map((g) => ({
      id: g.id,
      path: [g.id],
    }))

  let currentNode = stack.pop()
  while (currentNode !== undefined) {
    const { id, path } = currentNode

    if (fn(currentNode)) {
      return currentNode
    } else {
      const currentGenre = tree.get(id)
      if (currentGenre) {
        stack.push(
          ...currentGenre.childGenres.map((g) => ({
            id: g.id,
            path: [...path, g.id],
          }))
        )
      }
      currentNode = stack.pop()
    }
  }
}
