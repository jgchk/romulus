import { type GenreStore } from '../infrastructure'
import { type TreePath } from '../types'
import { createGetChildrenQuery } from './get-children'
import { createGetDerivationsQuery } from './get-derivations'
import { createGetGenreQuery } from './get-genre'
import { createGetRootGenresQuery } from './get-root-genres'

export type GetPathToQuery = (id: number, existingPath?: TreePath) => TreePath | undefined

export function createGetPathToQuery(genres: GenreStore): GetPathToQuery {
  const getGenre = createGetGenreQuery(genres)
  const getRootGenres = createGetRootGenresQuery(genres)
  const getChildren = createGetChildrenQuery(genres)
  const getDerivations = createGetDerivationsQuery(genres)

  function getPathTo(id: number, existingPath?: TreePath): TreePath | undefined {
    if (!getGenre(id)) {
      return undefined
    }

    if (existingPath && existingPath.length > 0) {
      const pathUsingExistingPath = findPathUsingExistingPath(id, existingPath)
      if (pathUsingExistingPath !== undefined) {
        return pathUsingExistingPath
      }
    }

    return findAbsoluteShortestPath(id)
  }

  function findPathUsingExistingPath(id: number, existingPath: TreePath): TreePath | undefined {
    if (!getGenre(id)) {
      return undefined
    }

    const parentMap = new Map<
      number,
      { type: 'parent'; id: number } | { type: 'derivedFrom'; id: number }
    >()
    const queue: number[] = []

    const rootChildren = getChildren(existingPath[existingPath.length - 1] as number)
    if (rootChildren.includes(id)) {
      return [...existingPath, id]
    }
    for (const rootChild of rootChildren) {
      queue.push(rootChild)
      parentMap.set(rootChild, { type: 'parent', id: -1 }) // Sentinel for roots
    }

    const rootDerivations = getDerivations(existingPath[existingPath.length - 1] as number)
    if (rootDerivations.includes(id)) {
      return [...existingPath, 'derived', id]
    }
    for (const rootDerivation of rootDerivations) {
      queue.push(rootDerivation)
      parentMap.set(rootDerivation, { type: 'derivedFrom', id: -1 }) // Sentinel for roots
    }

    while (queue.length > 0) {
      const current = queue.shift()!

      const children = getChildren(current)
      for (const child of children) {
        if (!parentMap.has(child)) {
          parentMap.set(child, { type: 'parent', id: current })
          queue.push(child)
        }
      }

      const derivations = getDerivations(current)
      for (const derivation of derivations) {
        if (!parentMap.has(derivation)) {
          parentMap.set(derivation, { type: 'derivedFrom', id: current })
          queue.push(derivation)
        }
      }
    }

    if (!parentMap.has(id)) {
      return undefined
    }

    const path: TreePath = [id]
    let current: { type: 'parent'; id: number } | { type: 'derivedFrom'; id: number } | undefined =
      parentMap.get(id)
    while (current !== undefined && current.id !== -1) {
      if (current.type === 'derivedFrom') {
        path.push('derived', current.id)
      } else {
        path.push(current.id)
      }

      current = parentMap.get(current.id)
    }
    path.reverse()
    return [...existingPath, ...path]
  }

  function findAbsoluteShortestPath(id: number): TreePath | undefined {
    if (!getGenre(id)) {
      return undefined
    }

    const parentMap = new Map<
      number,
      { type: 'parent'; id: number } | { type: 'derivedFrom'; id: number }
    >()
    const queue: number[] = []

    const roots = getRootGenres()
    if (roots.includes(id)) {
      return [id]
    }

    for (const root of roots) {
      queue.push(root)
      parentMap.set(root, { type: 'parent', id: -1 }) // Sentinel for roots
    }

    while (queue.length > 0) {
      const current = queue.shift()!

      const children = getChildren(current)
      for (const child of children) {
        if (!parentMap.has(child)) {
          parentMap.set(child, { type: 'parent', id: current })
          queue.push(child)
        }
      }

      const derivations = getDerivations(current)
      for (const derivation of derivations) {
        if (!parentMap.has(derivation)) {
          parentMap.set(derivation, { type: 'derivedFrom', id: current })
          queue.push(derivation)
        }
      }
    }

    if (!parentMap.has(id)) {
      return undefined
    }

    const path: TreePath = [id]
    let current: { type: 'parent'; id: number } | { type: 'derivedFrom'; id: number } | undefined =
      parentMap.get(id)
    while (current !== undefined && current.id !== -1) {
      if (current.type === 'derivedFrom') {
        path.push('derived', current.id)
      } else {
        path.push(current.id)
      }

      current = parentMap.get(current.id)
    }
    path.reverse()
    return path
  }

  return getPathTo
}
