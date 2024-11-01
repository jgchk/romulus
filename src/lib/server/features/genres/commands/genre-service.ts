import { CreateGenreCommand } from './application/commands/create-genre'
import { DeleteGenreCommand } from './application/commands/delete-genre'
import { UpdateGenreCommand } from './application/commands/update-genre'
import type { GenreConstructorParams, GenreUpdate } from './domain/genre'
import type { GenreHistoryRepository } from './domain/genre-history-repository'
import type { GenreRelevanceVoteRepository } from './domain/genre-relevance-vote-repository'
import type { GenreRepository } from './domain/genre-repository'

export type CreateRelease = {
  title: string
  art?: string
  artists: number[]
  tracks: (number | { title: string; artists: number[] })[]
}

export class GenreService {
  private createGenreCommand: CreateGenreCommand
  private updateGenreCommand: UpdateGenreCommand
  private deleteGenreCommand: DeleteGenreCommand

  constructor(
    genreRepo: GenreRepository,
    genreHistoryRepo: GenreHistoryRepository,
    genreRelevanceVoteRepo: GenreRelevanceVoteRepository,
  ) {
    this.createGenreCommand = new CreateGenreCommand(
      genreRepo,
      genreHistoryRepo,
      genreRelevanceVoteRepo,
    )
    this.updateGenreCommand = new UpdateGenreCommand(genreRepo, genreHistoryRepo)
    this.deleteGenreCommand = new DeleteGenreCommand(genreRepo, genreHistoryRepo)
  }

  async createGenre(data: GenreConstructorParams, accountId: number) {
    return this.createGenreCommand.execute(data, accountId)
  }

  async updateGenre(id: number, data: GenreUpdate, accountId: number) {
    return this.updateGenreCommand.execute(id, data, accountId)
  }

  async deleteGenre(id: number, accountId: number) {
    return this.deleteGenreCommand.execute(id, accountId)
  }
}
