import { CommandsCompositionRoot } from './commands/composition-root.js'
import { QueriesCompositionRoot } from './queries/composition-root.js'
import type { IDrizzleConnection } from './queries/infrastructure/drizzle-database.js'
import {
  getDbConnection,
  getPostgresConnection,
} from './queries/infrastructure/drizzle-postgres-connection.js'

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
