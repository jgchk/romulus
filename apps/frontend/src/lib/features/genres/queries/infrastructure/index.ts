import { type TreeGenre } from '../types'

export type GenreStore = Map<number, TreeGenre>

export function createGenreStore(genres: TreeGenre[]) {
  return new Map(genres.map((genre) => [genre.id, genre]))
}
