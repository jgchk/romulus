import type { IDrizzleConnection } from '$lib/server/db/connection'

import { GetAllReleasesQuery, type GetAllReleasesResult } from './application/get-all-releases'
import { GetReleaseQuery, type GetReleaseResult } from './application/get-release'

export class MusicCatalogQueryService {
  private getAllReleasesQuery: GetAllReleasesQuery
  private getReleaseQuery: GetReleaseQuery

  constructor(db: IDrizzleConnection) {
    this.getAllReleasesQuery = new GetAllReleasesQuery(db)
    this.getReleaseQuery = new GetReleaseQuery(db)
  }

  getAllReleases(): Promise<GetAllReleasesResult> {
    return this.getAllReleasesQuery.execute()
  }

  getRelease(id: number): Promise<GetReleaseResult> {
    return this.getReleaseQuery.execute(id)
  }
}
