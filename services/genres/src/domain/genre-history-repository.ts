import type { GenreHistory } from './genre-history.js'

export type GenreHistoryRepository = {
  findLatestByGenreId(genreId: number): Promise<GenreHistory | undefined>
  create(history: GenreHistory): Promise<void>
}
