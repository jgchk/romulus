import type { TreeGenre } from './types'

export type GetChildrenQuery = (id: number) => number[]

export function createGetChildrenQuery(genres: TreeGenre[]): GetChildrenQuery {
  return function getChildren(id: number) {
    return genres.find((genre) => genre.id === id)?.children ?? []
  }
}
