import type { IAuthenticationApplication } from '@romulus/authentication'

import type { UserSettingsApplication } from './application'
import type { IDrizzleConnection } from './infrastructure/drizzle-database'
import {
  getDbConnection,
  getPostgresConnection,
  migrate,
} from './infrastructure/drizzle-postgres-connection'
import { CompositionRoot } from './web/composition-root'
import type { Router } from './web/router'
import { createRouter } from './web/router'

export { UserSettingsClient, UserSettingsClientError } from './web/client'

export class UserSettingsService {
  private constructor(
    private db: IDrizzleConnection,
    private di: CompositionRoot,
  ) {}

  static async create(
    databaseUrl: string,
    authentication: IAuthenticationApplication,
  ): Promise<UserSettingsService> {
    const pg = getPostgresConnection(databaseUrl)
    const db = getDbConnection(pg)
    await migrate(db)

    const di = new CompositionRoot(db, authentication)

    return new UserSettingsService(db, di)
  }

  use(): UserSettingsApplication {
    return this.di.application()
  }

  getRouter(): Router {
    return createRouter(this.di)
  }

  async destroy(): Promise<void> {
    await this.db.close()
  }
}
