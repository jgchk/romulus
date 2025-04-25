import { type Sql } from 'postgres'

import { type IAuthorizerRepository } from '../domain/repository.js'
import { type IDrizzleConnection } from './drizzle-database.js'
import { getDbConnection, getPostgresConnection, migrate } from './drizzle-postgres-connection.js'
import { DrizzleAuthorizerRepository } from './drizzle-repository.js'

export * as pglite from './drizzle-pglite-connection.js'
export * as pg from './drizzle-postgres-connection.js'

export class AuthorizationInfrastructure {
  private constructor(
    private pg: Sql,
    private db: IDrizzleConnection,
  ) {}

  static async create(databaseUrl: string): Promise<AuthorizationInfrastructure> {
    const pg = getPostgresConnection(databaseUrl)
    const db = getDbConnection(pg)

    await migrate(db)

    return new AuthorizationInfrastructure(pg, db)
  }

  async destroy(): Promise<void> {
    await this.pg.end()
  }

  dbConnection(): IDrizzleConnection {
    return this.db
  }

  authorizerRepo(): IAuthorizerRepository {
    return new DrizzleAuthorizerRepository(this.dbConnection())
  }
}
