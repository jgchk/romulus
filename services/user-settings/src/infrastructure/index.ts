import { type Sql } from 'postgres'

import { type IUserSettingsRepository } from '../domain/repository.js'
import { type IDrizzleConnection } from './drizzle-database.js'
import { getDbConnection, getPostgresConnection, migrate } from './drizzle-postgres-connection.js'
import { DrizzleUserSettingsRepository } from './drizzle-repository.js'

export * as pglite from './drizzle-pglite-connection.js'
export * as pg from './drizzle-postgres-connection.js'

export class UserSettingsInfrastructure {
  private constructor(
    private pg: Sql,
    private db: IDrizzleConnection,
  ) {}

  static async create(databaseUrl: string): Promise<UserSettingsInfrastructure> {
    const pg = getPostgresConnection(databaseUrl)
    const db = getDbConnection(pg)

    await migrate(db)

    return new UserSettingsInfrastructure(pg, db)
  }

  async destroy(): Promise<void> {
    await this.pg.end()
  }

  dbConnection(): IDrizzleConnection {
    return this.db
  }

  userSettingsRepository(): IUserSettingsRepository {
    return new DrizzleUserSettingsRepository(this.dbConnection())
  }
}
