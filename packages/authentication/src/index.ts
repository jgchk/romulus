import type { AuthorizationService } from '@romulus/authorization'
import { hc } from 'hono/client'

import type { Router } from './commands/web'
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

  static async create(
    databaseUrl: string,
    authorization: AuthorizationService,
  ): Promise<AuthenticationService> {
    const pg = getPostgresConnection(databaseUrl)
    const db = getDbConnection(pg)
    await migrate(db)

    const di = new CommandsCompositionRoot(db, 'auth_session')

    await authorization
      .use()
      .ensurePermissions([{ name: 'authentication:admin', description: undefined }])

    return new AuthenticationService(db, di)
  }

  getRouter() {
    return createRouter(this.di)
  }

  async destroy(): Promise<void> {
    await this.db.close()
  }
}

export function createAuthenticationClient(...args: Parameters<typeof hc>) {
  return hc<Router>(...args)
}
