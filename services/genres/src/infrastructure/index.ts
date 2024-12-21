import type { Sql } from 'postgres'

import type { GenreHistoryRepository } from '../domain/genre-history-repository'
import type { GenreRelevanceVoteRepository } from '../domain/genre-relevance-vote-repository'
import type { GenreRepository } from '../domain/genre-repository'
import type { GenreTreeRepository } from '../domain/genre-tree-repository'
import type { IDrizzleConnection } from './drizzle-database'
import { DrizzleGenreHistoryRepository } from './drizzle-genre-history-repository'
import { DrizzleGenreRelevanceVoteRepository } from './drizzle-genre-relevance-vote-repository'
import { DrizzleGenreRepository } from './drizzle-genre-repository'
import { DrizzleGenreTreeRepository } from './drizzle-genre-tree-repository'
import { getDbConnection, getPostgresConnection, migrate } from './drizzle-postgres-connection'

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
