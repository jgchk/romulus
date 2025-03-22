import type { TreeGenre } from './types'

export type GetRootGenresQuery = () => number[]

export function createGetRootGenresQuery(genres: TreeGenre[]): GetRootGenresQuery {
  return function getRootGenres() {
    return genres.filter((genre) => genre.parents.length === 0).map((genre) => genre.id)
  }
}
