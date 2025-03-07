import { GetMediaTypeTreeQueryHandler } from './application/get-media-type-tree.js'
import type { IDrizzleConnection } from './infrastructure/drizzle-database.js'

export class QueriesCompositionRoot {
  constructor(private _db: IDrizzleConnection) {}

  getMediaTypeTreeQueryHandler(): GetMediaTypeTreeQueryHandler {
    return new GetMediaTypeTreeQueryHandler(this.db())
  }

  private db(): IDrizzleConnection {
    return this._db
  }
}
