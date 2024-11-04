import type { CreateGenreCommand } from './application/commands/create-genre'
import type { DeleteGenreCommand } from './application/commands/delete-genre'
import type { UpdateGenreCommand } from './application/commands/update-genre'
import type { VoteGenreRelevanceCommand } from './application/commands/vote-genre-relevance'
import type { GenreConstructorParams, GenreUpdate } from './domain/genre'

export type CreateRelease = {
  title: string
  art?: string
  artists: number[]
  tracks: (number | { title: string; artists: number[] })[]
}

export class GenreCommandService {
  constructor(
    private createGenreCommand: CreateGenreCommand,
    private updateGenreCommand: UpdateGenreCommand,
    private deleteGenreCommand: DeleteGenreCommand,
    private voteGenreRelevanceCommand: VoteGenreRelevanceCommand,
  ) {}

  async createGenre(data: GenreConstructorParams, accountId: number) {
    return this.createGenreCommand.execute(data, accountId)
  }

  async updateGenre(id: number, data: GenreUpdate, accountId: number) {
    return this.updateGenreCommand.execute(id, data, accountId)
  }

  async deleteGenre(id: number, accountId: number) {
    return this.deleteGenreCommand.execute(id, accountId)
  }

  async voteGenreRelevance(genreId: number, relevance: number, accountId: number) {
    return this.voteGenreRelevanceCommand.execute(genreId, relevance, accountId)
  }
}
