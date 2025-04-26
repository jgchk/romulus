import type { GenreStore } from '../infrastructure'

export type GetChildrenQuery = (id: number) => number[]

export function createGetChildrenQuery(store: GenreStore): GetChildrenQuery {
  return function getChildren(id: number) {
    return store.get(id)?.children ?? []
  }
}
