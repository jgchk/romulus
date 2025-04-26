import type { GenreStore } from '../infrastructure'
import type { TreeGenre } from '../types'

export type GetGenreQuery = (id: number) => TreeGenre | undefined

export function createGetGenreQuery(genres: GenreStore): GetGenreQuery {
  return function getGenre(id: number) {
    return genres.get(id)
  }
}
