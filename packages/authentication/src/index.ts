import { createRouter } from './commands/web'
import { CommandsCompositionRoot } from './commands/web/composition-root'
import type { IDrizzleConnection } from './shared/infrastructure/drizzle-database'
import {
  getDbConnection,
  getPostgresConnection,
  migrate,
} from './shared/infrastructure/drizzle-postgres-connection'

export class AuthenticationService {
  private constructor(
    private db: IDrizzleConnection,
    private di: CommandsCompositionRoot,
  ) {}

  static async create(databaseUrl: string): Promise<AuthenticationService> {
    const pg = getPostgresConnection(databaseUrl)
    const db = getDbConnection(pg)
    await migrate(db)
    const di = new CommandsCompositionRoot(db, 'auth_session')
    return new AuthenticationService(db, di)
  }

  getRouter() {
    return createRouter(this.di)
  }

  async destroy(): Promise<void> {
    await this.db.close()
  }
}
