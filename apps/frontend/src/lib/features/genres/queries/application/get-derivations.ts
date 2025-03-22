import type { TreeGenre } from '../types'

export type GetDerivationsQuery = (id: number) => number[]

export function createGetDerivationsQuery(genres: TreeGenre[]): GetDerivationsQuery {
  return function getDerivations(id: number) {
    return genres.filter((genre) => genre.derivedFrom.includes(id)).map((genre) => genre.id)
  }
}
