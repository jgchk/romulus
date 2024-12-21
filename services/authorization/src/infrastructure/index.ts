import type { Sql } from 'postgres'

import type { IAuthorizerRepository } from '../domain/repository'
import type { IDrizzleConnection } from './drizzle-database'
import { getDbConnection, getPostgresConnection, migrate } from './drizzle-postgres-connection'
import { DrizzleAuthorizerRepository } from './drizzle-repository'

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
