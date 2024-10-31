import { UpdateGenreCommand } from './application/commands/update-genre'
import type { GenreUpdate } from './domain/genre'
import type { GenreHistoryRepository } from './domain/genre-history-repository'
import type { GenreRepository } from './domain/genre-repository'

export type CreateRelease = {
  title: string
  art?: string
  artists: number[]
  tracks: (number | { title: string; artists: number[] })[]
}

export class GenreService {
  private updateGenreCommand: UpdateGenreCommand

  constructor(genreRepo: GenreRepository, genreHistoryRepo: GenreHistoryRepository) {
    this.updateGenreCommand = new UpdateGenreCommand(genreRepo, genreHistoryRepo)
  }

  async updateGenre(id: number, data: GenreUpdate, accountId: number) {
    return this.updateGenreCommand.execute(id, data, accountId)
  }
}
