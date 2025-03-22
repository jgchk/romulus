import type { TreeGenre, TreePath } from '../types'
import { createGetChildrenQuery } from './get-children'
import { createGetDerivationsQuery } from './get-derivations'
import { createGetRootGenresQuery } from './get-root-genres'

export type IsPathValidQuery = (path: TreePath) => boolean

export function createIsPathValidQuery(genres: TreeGenre[]): IsPathValidQuery {
  return function isPathValid(path: TreePath) {
    const getRootGenres = createGetRootGenresQuery(genres)
    const getDerivations = createGetDerivationsQuery(genres)
    const getChildren = createGetChildrenQuery(genres)

    const rootNode = path[0]
    if (rootNode === 'derived' || !getRootGenres().includes(rootNode)) {
      return false
    }

    for (let i = path.length - 1; i >= 0; i--) {
      const currentId = path[i]
      const parentId = path[i - 1]
      const grandparentId = path[i - 2]

      if (currentId === 'derived') {
        if (parentId === 'derived') return false
        if (parentId === undefined) return false

        const parentDerivations = getDerivations(parentId)
        if (parentDerivations.length === 0) return false
      } else if (parentId === 'derived') {
        if (grandparentId === 'derived') return false
        if (grandparentId === undefined) return false

        const grandparentDerivations = getDerivations(grandparentId)
        if (grandparentDerivations.length === 0) return false
        if (!grandparentDerivations.includes(currentId)) return false
      } else {
        if (parentId === undefined) continue

        const parentChildren = getChildren(parentId)
        if (parentChildren.length === 0) return false
        if (!parentChildren.includes(currentId)) return false
      }
    }

    return true
  }
}
