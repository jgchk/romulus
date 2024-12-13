import type { IAuthenticationApplication } from '@romulus/authentication'

import { GenreCommandsApplication } from './commands/application'
import type { GenreHistoryRepository } from './commands/domain/genre-history-repository'
import type { GenreRelevanceVoteRepository } from './commands/domain/genre-relevance-vote-repository'
import type { GenreRepository } from './commands/domain/genre-repository'
import type { GenreTreeRepository } from './commands/domain/genre-tree-repository'
import { DrizzleGenreHistoryRepository } from './commands/infrastructure/drizzle-genre-history-repository'
import { DrizzleGenreRelevanceVoteRepository } from './commands/infrastructure/drizzle-genre-relevance-vote-repository'
import { DrizzleGenreRepository } from './commands/infrastructure/drizzle-genre-repository'
import { DrizzleGenreTreeRepository } from './commands/infrastructure/drizzle-genre-tree-repository'
import { GenreQueriesApplication } from './queries/application'
import type { IDrizzleConnection } from './shared/infrastructure/drizzle-database'

export class CompositionRoot {
  constructor(
    private _dbConnection: IDrizzleConnection,
    private _authentication: IAuthenticationApplication,
  ) {}

  commands(): GenreCommandsApplication {
    return new GenreCommandsApplication(
      this.genreRepository(),
      this.genreTreeRepository(),
      this.genreHistoryRepository(),
      this.genreRelevanceVoteRepository(),
    )
  }

  queries(): GenreQueriesApplication {
    return new GenreQueriesApplication(this.dbConnection())
  }

  authentication(): IAuthenticationApplication {
    return this._authentication
  }

  private dbConnection(): IDrizzleConnection {
    return this._dbConnection
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
