import type { IAuthenticationApplication } from '@romulus/authentication'

import type { IAuthorizationApplication } from '../application'
import { AuthorizationApplication } from '../application'
import type { IAuthorizerRepository } from '../domain/repository'
import type { IDrizzleConnection } from '../infrastructure/drizzle-database'
import { DrizzleAuthorizerRepository } from '../infrastructure/drizzle-repository'

export class CompositionRoot {
  constructor(
    private _dbConnection: IDrizzleConnection,
    private _authentication: IAuthenticationApplication,
  ) {}

  authentication(): IAuthenticationApplication {
    return this._authentication
  }

  application(): IAuthorizationApplication {
    return new AuthorizationApplication(this.authorizerRepository())
  }

  private authorizerRepository(): IAuthorizerRepository {
    return new DrizzleAuthorizerRepository(this.dbConnection())
  }

  private dbConnection(): IDrizzleConnection {
    return this._dbConnection
  }
}
