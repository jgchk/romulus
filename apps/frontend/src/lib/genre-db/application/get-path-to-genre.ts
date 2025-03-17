import type { TreePath } from '../types'
import type { GetChildrenQuery } from './get-children'
import type { GetGenreQuery } from './get-genre'
import type { GetRootGenresQuery } from './get-root-genres'

export type GetPathToGenreQuery = (genreId: number) => Promise<TreePath | undefined>

export function createGetPathToGenreQuery({
  getGenre,
  getRootGenres,
  getChildren,
}: {
  getGenre: GetGenreQuery
  getRootGenres: GetRootGenresQuery
  getChildren: GetChildrenQuery
}): GetPathToGenreQuery {
  return async function getPathToGenre(id: number) {
    // Check if the target genre exists
    const genre = await getGenre(id)
    if (!genre) {
      return undefined
    }

    // If the target is a root genre, return a path with just itself
    if (genre.parents.length === 0) {
      return [id]
    }

    // Initialize BFS data structures
    const parentMap = new Map<number, number>() // Maps genre ID to its parent in the shortest path
    const queue: number[] = [] // Queue for BFS traversal
    const roots = await getRootGenres() // Get all root genres (no parents)

    // Seed the queue with all root genres
    for (const root of roots) {
      queue.push(root.id)
      parentMap.set(root.id, -1) // Use -1 as a sentinel value for roots
    }

    // Perform BFS
    while (queue.length > 0) {
      const current = queue.shift()! // Dequeue the next genre
      const children = await getChildren(current) // Get its children
      for (const child of children) {
        if (!parentMap.has(child.id)) {
          // If child hasn't been visited
          parentMap.set(child.id, current) // Record its parent
          queue.push(child.id) // Enqueue the child
        }
      }
    }

    // Check if the target is reachable
    if (!parentMap.has(id)) {
      return undefined // Target not reachable from any root
    }

    // Reconstruct the path from target to root
    const path: number[] = []
    let current: number | undefined = id
    while (current !== undefined && current !== -1) {
      path.push(current)
      current = parentMap.get(current) // Move to the parent
    }

    // Reverse the path to go from root to target
    path.reverse()
    return path
  }
}
