import { equals } from 'ramda'

import type { TreeGenre } from './state'

export type TreeSearchNode = {
  id: number
  path: number[]
}

function treeBfs(tree: Map<number, TreeGenre>, fn: (node: TreeSearchNode) => boolean) {
  const stack: TreeSearchNode[] = [...tree.values()]
    .filter((g) => g.parents.length === 0)
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
          ...currentGenre.children.map((childId) => ({
            id: childId,
            path: [...path, childId],
          })),
        )
      }
      currentNode = stack.pop()
    }
  }
}

export function isPathValid(genres: Map<number, TreeGenre>, id: number, path: number[]) {
  const existingNode = treeBfs(genres, (node) => node.id === id && equals(node.path, path))
  return existingNode !== undefined
}

type Source = 'ancestor' | 'pre-expanded' | 'new'
export function getNewPath(
  genres: Map<number, TreeGenre>,
  expanded: Set<string>,
  currentPath: number[] | undefined,
  newId: number,
): { path: number[]; source: Source } | undefined {
  // try to use an ancestor path
  if (currentPath) {
    const indexOfId = currentPath.indexOf(newId)

    // if our path already points to this id, return nothing
    if (indexOfId === currentPath.length - 1) {
      return
    }

    // if our path contains this id as an ancestor, return the path up to this id
    if (indexOfId !== -1) {
      const path = currentPath.slice(0, indexOfId + 1)
      return { path, source: 'ancestor' }
    }
  }

  // otherwise, get a pre-expanded path to this id
  const preExpandedPath = getExpandedPathToId(genres, expanded, newId)
  if (preExpandedPath) {
    return { path: preExpandedPath, source: 'pre-expanded' }
  }

  // otherwise, search for a brand new path
  const node = treeBfs(genres, (node) => node.id === newId)
  if (node) {
    return { path: node.path, source: 'new' }
  }
}

function getExpandedPathToId(genres: Map<number, TreeGenre>, expanded: Set<string>, id: number) {
  const parents = genres.get(id)?.parents ?? []

  for (const path_ of expanded) {
    const path = path_.split('-').map((x) => Number.parseInt(x))

    for (const parent of parents) {
      const indexOfId = path.indexOf(parent)
      if (indexOfId !== -1) {
        return [...path.slice(0, indexOfId + 1), id]
      }
    }
  }
}
