import type { GenreStore } from '../infrastructure'

export type GetDerivationsQuery = (id: number) => number[]

export function createGetDerivationsQuery(store: GenreStore): GetDerivationsQuery {
  return function getDerivations(id: number) {
    return store.get(id)?.derivations ?? []
  }
}
