import type { TreeGenre } from '../types'

export type GetRootGenresQuery = () => number[]

export function createGetRootGenresQuery(genres: TreeGenre[]): GetRootGenresQuery {
  return function getRootGenres() {
    // Step 1: Collect all child IDs into a Set
    const childIds = new Set<number>()
    for (const node of genres) {
      for (const childId of node.children) {
        childIds.add(childId)
      }
    }

    // Step 2: Identify nodes that are not in childIds (i.e., roots)
    const rootIds: number[] = []
    for (const node of genres) {
      if (!childIds.has(node.id)) {
        rootIds.push(node.id)
      }
    }

    // Step 3: Return the array of root IDs
    return rootIds
  }
}
