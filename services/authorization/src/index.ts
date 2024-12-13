import { AuthorizationApplication } from './application'
import type { IDrizzleConnection } from './infrastructure/drizzle-database'
import {
  getDbConnection,
  getPostgresConnection,
  migrate,
} from './infrastructure/drizzle-postgres-connection'
import { DrizzleAuthorizerRepository } from './infrastructure/drizzle-repository'

export type { IAuthorizationApplication } from './application'

export class AuthorizationService {
  private constructor(
    private db: IDrizzleConnection,
    private application: AuthorizationApplication,
  ) {}

  static async create(databaseUrl: string): Promise<AuthorizationService> {
    const pg = getPostgresConnection(databaseUrl)
    const db = getDbConnection(pg)
    await migrate(db)
    const service = new AuthorizationApplication(new DrizzleAuthorizerRepository(db))
    return new AuthorizationService(db, service)
  }

  use() {
    return this.application
  }

  async destroy(): Promise<void> {
    await this.db.close()
  }
}
