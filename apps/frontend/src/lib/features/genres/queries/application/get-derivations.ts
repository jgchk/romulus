import type { GenreStore } from '../infrastructure'

export type GetDerivationsQuery = (id: number) => number[]

export function createGetDerivationsQuery(genres: GenreStore): GetDerivationsQuery {
  return function getDerivations(id: number) {
    return [...genres.values()]
      .filter((genre) => genre.derivedFrom.includes(id))
      .map((genre) => genre.id)
  }
}
