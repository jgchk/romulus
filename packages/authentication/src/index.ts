import type { AuthorizationService } from '@romulus/authorization'
import { hc } from 'hono/client'

import type { IDrizzleConnection } from './infrastructure/drizzle-database'
import {
  getDbConnection,
  getPostgresConnection,
  migrate,
} from './infrastructure/drizzle-postgres-connection'
import type { Router } from './web'
import { createRouter } from './web'
import { CommandsCompositionRoot } from './web/composition-root'

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

    const di = new CommandsCompositionRoot(db)

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
