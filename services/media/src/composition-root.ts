import { CommandsCompositionRoot } from './commands/composition-root'
import { QueriesCompositionRoot } from './queries/composition-root'
import type { IDrizzleConnection } from './queries/infrastructure/drizzle-database'
import {
  getDbConnection,
  getPostgresConnection,
} from './queries/infrastructure/drizzle-postgres-connection'

export class CompositionRoot {
  private _db: IDrizzleConnection

  constructor() {
    this._db = getDbConnection(getPostgresConnection())
  }

  commands(): CommandsCompositionRoot {
    return new CommandsCompositionRoot()
  }

  queries(): QueriesCompositionRoot {
    return new QueriesCompositionRoot(this.db())
  }

  db(): IDrizzleConnection {
    return this._db
  }
}
