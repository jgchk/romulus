import type { IDrizzleConnection } from '../shared/infrastructure/drizzle-database'
import { AuthenticationQueryService } from './query-service'

export class QueriesCompositionRoot {
  constructor(private _dbConnection: IDrizzleConnection) {}

  private dbConnection(): IDrizzleConnection {
    return this._dbConnection
  }

  authenticationQueryService(): AuthenticationQueryService {
    return new AuthenticationQueryService(this.dbConnection())
  }
}
