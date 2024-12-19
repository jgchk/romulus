import { AuthorizationClient } from '@romulus/authorization'

import { AuthenticationPermission } from './domain/permissions'
import type { IDrizzleConnection } from './infrastructure/drizzle-database'
import {
  getDbConnection,
  getPostgresConnection,
  migrate,
} from './infrastructure/drizzle-postgres-connection'
import { CommandsCompositionRoot } from './web/composition-root'
import type { Router } from './web/router'
import { createRouter } from './web/router'

export type { IAuthenticationApplication } from './application'

export class AuthenticationService {
  private constructor(
    private db: IDrizzleConnection,
    private di: CommandsCompositionRoot,
    private authorizationBaseUrl: string,
  ) {}

  static async create(
    databaseUrl: string,
    systemUserToken: string,
    authorizationBaseUrl: string,
  ): Promise<AuthenticationService> {
    const pg = getPostgresConnection(databaseUrl)
    const db = getDbConnection(pg)
    await migrate(db)

    const di = new CommandsCompositionRoot(db)

    const authorization = new AuthorizationClient(authorizationBaseUrl, systemUserToken)
    const result = await authorization.ensurePermissions([
      { name: AuthenticationPermission.RequestPasswordReset, description: undefined },
    ])
    if (result.isErr()) throw result.error

    return new AuthenticationService(db, di, authorizationBaseUrl)
  }

  getRouter(): Router {
    return createRouter(
      this.di,
      (sessionToken: string) => new AuthorizationClient(this.authorizationBaseUrl, sessionToken),
    )
  }

  async destroy(): Promise<void> {
    await this.db.close()
  }
}
