import { AuthorizationApplication } from '../application'
import type { IAuthorizerRepository } from '../domain/repository'
import type { IDrizzleConnection } from '../infrastructure/drizzle-database'
import { DrizzleAuthorizerRepository } from '../infrastructure/drizzle-repository'

export class CompositionRoot {
  constructor(private _dbConnection: IDrizzleConnection) {}

  application(): AuthorizationApplication {
    return new AuthorizationApplication(this.authorizerRepository())
  }

  private authorizerRepository(): IAuthorizerRepository {
    return new DrizzleAuthorizerRepository(this.dbConnection())
  }

  private dbConnection(): IDrizzleConnection {
    return this._dbConnection
  }
}
