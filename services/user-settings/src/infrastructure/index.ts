import type { Sql } from 'postgres'

import type { IUserSettingsRepository } from '../domain/repository'
import type { IDrizzleConnection } from './drizzle-database'
import { getDbConnection, getPostgresConnection, migrate } from './drizzle-postgres-connection'
import { DrizzleUserSettingsRepository } from './drizzle-repository'

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
