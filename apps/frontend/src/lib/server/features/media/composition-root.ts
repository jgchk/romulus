import { MediaCommandsCompositionRoot } from './commands/composition-root'
import { MediaQueriesCompositionRoot } from './queries/composition-root'
import type { IDrizzleConnection } from './queries/infrastructure/drizzle-database'

export class MediaCompositionRoot {
  constructor(private _db: IDrizzleConnection) {}

  commands(): MediaCommandsCompositionRoot {
    return new MediaCommandsCompositionRoot()
  }

  queries(): MediaQueriesCompositionRoot {
    return new MediaQueriesCompositionRoot(this.db())
  }

  private db() {
    return this._db
  }
}
