import { AuthorizationApplication } from '../application/index.js'
import type { IAuthorizerRepository } from '../domain/repository.js'
import type { IDrizzleConnection } from '../infrastructure/drizzle-database.js'
import { DrizzleAuthorizerRepository } from '../infrastructure/drizzle-repository.js'

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
