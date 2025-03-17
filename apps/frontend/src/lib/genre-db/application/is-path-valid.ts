import type { TreePath } from '../types'
import type { GetChildrenQuery } from './get-children'
import type { GetDerivationsQuery } from './get-derivations'
import type { GetRootGenresQuery } from './get-root-genres'

export type IsPathValidQuery = (path: TreePath) => Promise<boolean>

export function createIsPathValidQuery({
  getRootGenres,
  getDerivations,
  getChildren,
}: {
  getRootGenres: GetRootGenresQuery
  getDerivations: GetDerivationsQuery
  getChildren: GetChildrenQuery
}): IsPathValidQuery {
  return async function isPathValid(path: TreePath) {
    const rootNode = path[0]
    if (rootNode === 'derived') return false

    const rootGenres = await getRootGenres()
    if (!rootGenres.some((rootGenre) => rootGenre.id === rootNode)) return false

    for (let i = path.length - 1; i >= 0; i--) {
      const currentId = path[i]
      const parentId = path[i - 1]
      const grandparentId = path[i - 2]

      if (currentId === 'derived') {
        if (parentId === 'derived') return false
        if (parentId === undefined) return false

        const parentDerivations = await getDerivations(parentId)
        if (parentDerivations.length === 0) return false
      } else if (parentId === 'derived') {
        if (grandparentId === 'derived') return false
        if (grandparentId === undefined) return false

        const grandparentDerivations = await getDerivations(grandparentId)
        if (grandparentDerivations.length === 0) return false
        if (!grandparentDerivations.some((genre) => genre.id === currentId)) return false
      } else {
        if (parentId === undefined) continue

        const parentChildren = await getChildren(parentId)
        if (parentChildren.length === 0) return false
        if (!parentChildren.some((genre) => genre.id === currentId)) return false
      }
    }

    return true
  }
}
