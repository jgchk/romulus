import { AuthenticationClient } from '@romulus/authentication/client'

import type { IDrizzleConnection } from './infrastructure/drizzle-database'
import {
  getDbConnection,
  getPostgresConnection,
  migrate,
} from './infrastructure/drizzle-postgres-connection'
import { CompositionRoot } from './web/composition-root'
import type { Router } from './web/router'
import { createRouter } from './web/router'

export class UserSettingsService {
  private constructor(
    private db: IDrizzleConnection,
    private di: CompositionRoot,
    private authenticationBaseUrl: string,
  ) {}

  static async create(
    databaseUrl: string,
    authenticationBaseUrl: string,
  ): Promise<UserSettingsService> {
    const pg = getPostgresConnection(databaseUrl)
    const db = getDbConnection(pg)
    await migrate(db)

    const di = new CompositionRoot(db)

    return new UserSettingsService(db, di, authenticationBaseUrl)
  }

  getRouter(): Router {
    return createRouter(
      this.di,
      (sessionToken: string) => new AuthenticationClient(this.authenticationBaseUrl, sessionToken),
    )
  }

  async destroy(): Promise<void> {
    await this.db.close()
  }
}
