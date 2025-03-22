import type { TreeGenre } from './types'

export type GetGenreQuery = (id: number) => TreeGenre | undefined

export function createGetGenreQuery(genres: TreeGenre[]): GetGenreQuery {
  return function getGenre(id: number) {
    return genres.find((genre) => genre.id === id)
  }
}
