import { type GenreStore } from '../infrastructure'

export type GetRootGenresQuery = () => number[]

export function createGetRootGenresQuery(genres: GenreStore): GetRootGenresQuery {
  return function getRootGenres() {
    // Step 1: Collect all child IDs and derived IDs into a Set
    const childIds = new Set<number>()
    for (const node of genres.values()) {
      for (const childId of node.children) {
        childIds.add(childId)
      }

      for (const derivation of node.derivations) {
        childIds.add(derivation)
      }
    }

    // Step 2: Identify nodes that are not in childIds (i.e., roots)
    const rootIds: number[] = []
    for (const genreId of genres.keys()) {
      if (!childIds.has(genreId)) {
        rootIds.push(genreId)
      }
    }

    // Step 3: Return the array of root IDs
    return rootIds
  }
}
