import type { GenreStore } from '../infrastructure'
import { createGetChildrenQuery } from './get-children'
import { createGetGenreQuery } from './get-genre'
import { createGetRootGenresQuery } from './get-root-genres'

export type GetPathToQuery = (id: number) => number[] | undefined

export function createGetPathToQuery(genres: GenreStore): GetPathToQuery {
  return function getPathTo(id: number) {
    const getGenre = createGetGenreQuery(genres)
    const getRootGenres = createGetRootGenresQuery(genres)
    const getChildren = createGetChildrenQuery(genres)

    // Check if the target genre exists
    const genre = getGenre(id)
    if (!genre) {
      return undefined
    }

    // Initialize BFS data structures
    const parentMap = new Map<number, number>() // Maps genre ID to its parent in the shortest path
    const queue: number[] = [] // Queue for BFS traversal
    const roots = getRootGenres() // Get all root genres (no parents)

    // If the target is a root genre, return a path with just itself
    if (roots.includes(id)) {
      return [id]
    }

    // Seed the queue with all root genres
    for (const root of roots) {
      queue.push(root)
      parentMap.set(root, -1) // Use -1 as a sentinel value for roots
    }

    // Perform BFS
    while (queue.length > 0) {
      const current = queue.shift()! // Dequeue the next genre
      const children = getChildren(current) // Get its children
      for (const child of children) {
        if (!parentMap.has(child)) {
          // If child hasn't been visited
          parentMap.set(child, current) // Record its parent
          queue.push(child) // Enqueue the child
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
