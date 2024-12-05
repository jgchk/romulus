import { CommandsCompositionRoot } from './commands/web/composition-root'
import { QueriesCompositionRoot } from './queries/composition-root'
import type { IDrizzleConnection } from './shared/infrastructure/drizzle-database'

export class AuthenticationCompositionRoot {
  constructor(
    private _dbConnection: IDrizzleConnection,
    private _sessionCookieName: string,
  ) {}

  private dbConnection(): IDrizzleConnection {
    return this._dbConnection
  }

  commands(): CommandsCompositionRoot {
    return new CommandsCompositionRoot(this.dbConnection(), this._sessionCookieName)
  }

  queries(): QueriesCompositionRoot {
    return new QueriesCompositionRoot(this.dbConnection())
  }
}
