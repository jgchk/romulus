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

    const currentGenre = tree.get(id)
    if (!currentGenre) {
      currentNode = queue.shift()
      continue
    }

    if (fn(currentNode)) {
      return currentNode
    } else {
      queue.push(
        ...currentGenre.childGenres.map((g) => ({
          id: g.id,
          path: [...path, g.id],
        }))
      )
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

    const currentGenre = tree.get(id)
    if (!currentGenre) {
      currentNode = stack.pop()
      continue
    }

    if (fn(currentNode)) {
      return currentNode
    } else {
      stack.push(
        ...currentGenre.childGenres.map((g) => ({
          id: g.id,
          path: [...path, g.id],
        }))
      )
      currentNode = stack.pop()
    }
  }
}
