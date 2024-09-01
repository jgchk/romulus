import type { IDrizzleConnection } from '$lib/server/db/connection'

import { GetAllReleasesQuery, type GetAllReleasesResult } from './application/get-all-releases'

export class MusicCatalogQueryService {
  private getAllReleasesQuery: GetAllReleasesQuery

  constructor(db: IDrizzleConnection) {
    this.getAllReleasesQuery = new GetAllReleasesQuery(db)
  }

  getAllReleases(): Promise<GetAllReleasesResult> {
    return this.getAllReleasesQuery.execute()
  }
}
