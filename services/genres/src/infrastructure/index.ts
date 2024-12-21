import { Sql } from 'postgres'
import { getDbConnection, getPostgresConnection } from './drizzle-postgres-connection'
import { IDrizzleConnection } from './drizzle-database'
import { GenreRepository } from '../domain/genre-repository'
import { DrizzleGenreRepository } from './drizzle-genre-repository'
import { GenreTreeRepository } from '../domain/genre-tree-repository'
import { DrizzleGenreTreeRepository } from './drizzle-genre-tree-repository'
import { DrizzleGenreHistoryRepository } from './drizzle-genre-history-repository'
import { GenreHistoryRepository } from '../domain/genre-history-repository'
import { GenreRelevanceVoteRepository } from '../domain/genre-relevance-vote-repository'
import { DrizzleGenreRelevanceVoteRepository } from './drizzle-genre-relevance-vote-repository'

export class GenresInfrastructure {
  private pg: Sql

  constructor(private databaseUrl: string) {
    this.pg = getPostgresConnection(this.databaseUrl)
  }

  dbConnection(): IDrizzleConnection {
    return getDbConnection(this.pg)
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
