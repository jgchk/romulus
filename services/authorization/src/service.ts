import { AuthenticationClient } from '@romulus/authentication/client'

import { AuthorizationApplication } from './application'
import { AuthorizationPermission, SYSTEM_USER_ID } from './domain/permissions'
import type { IDrizzleConnection } from './infrastructure/drizzle-database'
import {
  getDbConnection,
  getPostgresConnection,
  migrate,
} from './infrastructure/drizzle-postgres-connection'
import { DrizzleAuthorizerRepository } from './infrastructure/drizzle-repository'
import { CompositionRoot } from './web/composition-root'
import { createRouter } from './web/router'

export class AuthorizationService {
  private constructor(
    private db: IDrizzleConnection,
    private systemUserToken: string,
    private authenticationBaseUrl: string,
  ) {}

  static async create(
    databaseUrl: string,
    systemUserToken: string,
    authenticationBaseUrl: string,
  ): Promise<AuthorizationService> {
    const pg = getPostgresConnection(databaseUrl)
    const db = getDbConnection(pg)
    await migrate(db)

    const service = new AuthorizationApplication(new DrizzleAuthorizerRepository(db))

    await service.ensurePermissions(
      [{ name: AuthorizationPermission.CreatePermissions, description: undefined }],
      SYSTEM_USER_ID,
    )

    return new AuthorizationService(db, systemUserToken, authenticationBaseUrl)
  }

  getRouter() {
    const di = new CompositionRoot(this.db)
    return createRouter(
      di,
      this.systemUserToken,
      (sessionToken) => new AuthenticationClient(this.authenticationBaseUrl, sessionToken),
    )
  }

  async destroy(): Promise<void> {
    await this.db.close()
  }
}
