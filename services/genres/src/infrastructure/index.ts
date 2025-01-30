import type { Sql } from 'postgres'

import type { GenreHistoryRepository } from '../domain/genre-history-repository.js'
import type { GenreRelevanceVoteRepository } from '../domain/genre-relevance-vote-repository.js'
import type { GenreRepository } from '../domain/genre-repository.js'
import type { GenreTreeRepository } from '../domain/genre-tree-repository.js'
import type { IDrizzleConnection } from './drizzle-database.js'
import { DrizzleGenreHistoryRepository } from './drizzle-genre-history-repository.js'
import { DrizzleGenreRelevanceVoteRepository } from './drizzle-genre-relevance-vote-repository.js'
import { DrizzleGenreRepository } from './drizzle-genre-repository.js'
import { DrizzleGenreTreeRepository } from './drizzle-genre-tree-repository.js'
import { getDbConnection, getPostgresConnection, migrate } from './drizzle-postgres-connection.js'

export class GenresInfrastructure {
  private constructor(
    private pg: Sql,
    private db: IDrizzleConnection,
  ) {}

  static async create(databaseUrl: string): Promise<GenresInfrastructure> {
    const pg = getPostgresConnection(databaseUrl)
    const db = getDbConnection(pg)

    await migrate(db)

    return new GenresInfrastructure(pg, db)
  }

  async destroy(): Promise<void> {
    await this.pg.end()
  }

  dbConnection(): IDrizzleConnection {
    return this.db
  }

  genreRepo(): GenreRepository {
    return new DrizzleGenreRepository(this.dbConnection())
  }

  genreTreeRepo(): GenreTreeRepository {
    return new DrizzleGenreTreeRepository(this.dbConnection())
  }

  genreHistoryRepo(): GenreHistoryRepository {
    return new DrizzleGenreHistoryRepository(this.dbConnection())
  }

  genreRelevanceVoteRepo(): GenreRelevanceVoteRepository {
    return new DrizzleGenreRelevanceVoteRepository(this.dbConnection())
  }
}
