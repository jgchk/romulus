import type { GenreHistory } from '$lib/server/ddd/domain/genre-history'

export type GenreHistoryRepository = {
  findLatestByGenreId(genreId: number): Promise<GenreHistory | undefined>
  create(history: GenreHistory): Promise<void>
}
