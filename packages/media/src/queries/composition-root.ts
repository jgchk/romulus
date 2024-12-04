import { GetMediaTypeTreeQueryHandler } from './application/get-media-type-tree'
import type { IDrizzleConnection } from './infrastructure/drizzle-database'

export class MediaQueriesCompositionRoot {
  constructor(private _db: IDrizzleConnection) {}

  getMediaTypeTreeQueryHandler(): GetMediaTypeTreeQueryHandler {
    return new GetMediaTypeTreeQueryHandler(this.db())
  }

  private db(): IDrizzleConnection {
    return this._db
  }
}
