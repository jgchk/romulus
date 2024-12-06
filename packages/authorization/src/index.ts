import { AuthorizerService } from './application/authorizer-service'
import type { IDrizzleConnection } from './infrastructure/drizzle-database'
import {
  getDbConnection,
  getPostgresConnection,
  migrate,
} from './infrastructure/drizzle-postgres-connection'
import { DrizzleAuthorizerRepository } from './infrastructure/drizzle-repository'

export class AuthorizationService {
  private constructor(
    private db: IDrizzleConnection,
    private service: AuthorizerService,
  ) {}

  static async create(databaseUrl: string): Promise<AuthorizationService> {
    const pg = getPostgresConnection(databaseUrl)
    const db = getDbConnection(pg)
    await migrate(db)
    const service = new AuthorizerService(new DrizzleAuthorizerRepository(db))
    return new AuthorizationService(db, service)
  }

  use() {
    return this.service
  }

  async destroy(): Promise<void> {
    await this.db.close()
  }
}
