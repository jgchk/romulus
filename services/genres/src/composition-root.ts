import type { GenreHistoryRepository } from './commands/domain/genre-history-repository'
import type { GenreRelevanceVoteRepository } from './commands/domain/genre-relevance-vote-repository'
import type { GenreRepository } from './commands/domain/genre-repository'
import type { GenreTreeRepository } from './commands/domain/genre-tree-repository'
import { DrizzleGenreHistoryRepository } from './commands/infrastructure/drizzle-genre-history-repository'
import { DrizzleGenreRelevanceVoteRepository } from './commands/infrastructure/drizzle-genre-relevance-vote-repository'
import { DrizzleGenreRepository } from './commands/infrastructure/drizzle-genre-repository'
import { DrizzleGenreTreeRepository } from './commands/infrastructure/drizzle-genre-tree-repository'
import type { IDrizzleConnection } from './infrastructure/drizzle-database'

export class CompositionRoot {
  constructor(private _dbConnection: IDrizzleConnection) {}

  dbConnection(): IDrizzleConnection {
    return this._dbConnection
  }

  genreRepository(): GenreRepository {
    return new DrizzleGenreRepository(this.dbConnection())
  }

  genreTreeRepository(): GenreTreeRepository {
    return new DrizzleGenreTreeRepository(this.dbConnection())
  }

  genreHistoryRepository(): GenreHistoryRepository {
    return new DrizzleGenreHistoryRepository(this.dbConnection())
  }

  genreRelevanceVoteRepository(): GenreRelevanceVoteRepository {
    return new DrizzleGenreRelevanceVoteRepository(this.dbConnection())
  }
}
