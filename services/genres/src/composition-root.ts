import { CreateGenreCommand } from './commands/application/commands/create-genre'
import { DeleteGenreCommand } from './commands/application/commands/delete-genre'
import { UpdateGenreCommand } from './commands/application/commands/update-genre'
import { VoteGenreRelevanceCommand } from './commands/application/commands/vote-genre-relevance'
import { GenreCommandService } from './commands/command-service'
import type { GenreHistoryRepository } from './commands/domain/genre-history-repository'
import type { GenreRelevanceVoteRepository } from './commands/domain/genre-relevance-vote-repository'
import type { GenreRepository } from './commands/domain/genre-repository'
import type { GenreTreeRepository } from './commands/domain/genre-tree-repository'
import { DrizzleGenreHistoryRepository } from './commands/infrastructure/drizzle-genre-history-repository'
import { DrizzleGenreRelevanceVoteRepository } from './commands/infrastructure/drizzle-genre-relevance-vote-repository'
import { DrizzleGenreRepository } from './commands/infrastructure/drizzle-genre-repository'
import { DrizzleGenreTreeRepository } from './commands/infrastructure/drizzle-genre-tree-repository'
import { GenreQueryService } from './queries/query-service'
import type { IDrizzleConnection } from './shared/infrastructure/drizzle-database'

export class GenresCompositionRoot {
  constructor(private _dbConnection: IDrizzleConnection) {}

  private dbConnection(): IDrizzleConnection {
    return this._dbConnection
  }

  genreCommandService(): GenreCommandService {
    return new GenreCommandService(
      this.createGenreCommand(),
      this.updateGenreCommand(),
      this.deleteGenreCommand(),
      this.voteGenreRelevanceCommand(),
    )
  }

  genreQueryService(): GenreQueryService {
    return new GenreQueryService(this.dbConnection())
  }

  private createGenreCommand(): CreateGenreCommand {
    return new CreateGenreCommand(
      this.genreRepository(),
      this.genreTreeRepository(),
      this.genreHistoryRepository(),
    )
  }

  private updateGenreCommand(): UpdateGenreCommand {
    return new UpdateGenreCommand(
      this.genreRepository(),
      this.genreTreeRepository(),
      this.genreHistoryRepository(),
    )
  }

  private deleteGenreCommand(): DeleteGenreCommand {
    return new DeleteGenreCommand(
      this.genreRepository(),
      this.genreTreeRepository(),
      this.genreHistoryRepository(),
    )
  }

  private voteGenreRelevanceCommand(): VoteGenreRelevanceCommand {
    return new VoteGenreRelevanceCommand(this.genreRelevanceVoteRepository())
  }

  private genreRepository(): GenreRepository {
    return new DrizzleGenreRepository(this.dbConnection())
  }

  private genreTreeRepository(): GenreTreeRepository {
    return new DrizzleGenreTreeRepository(this.dbConnection())
  }

  private genreHistoryRepository(): GenreHistoryRepository {
    return new DrizzleGenreHistoryRepository(this.dbConnection())
  }

  private genreRelevanceVoteRepository(): GenreRelevanceVoteRepository {
    return new DrizzleGenreRelevanceVoteRepository(this.dbConnection())
  }
}
