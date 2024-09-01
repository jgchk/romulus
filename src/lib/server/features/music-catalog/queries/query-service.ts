import type { IDrizzleConnection } from '$lib/server/db/connection'

import { GetAllReleasesQuery, type GetAllReleasesResult } from './application/get-all-releases'
import { GetArtistQuery, type GetArtistResult } from './application/get-artist'
import { GetReleaseQuery, type GetReleaseResult } from './application/get-release'
import { GetTrackQuery, type GetTrackResult } from './application/get-track'

export class MusicCatalogQueryService {
  private getArtistQuery: GetArtistQuery
  private getAllReleasesQuery: GetAllReleasesQuery
  private getReleaseQuery: GetReleaseQuery
  private getTrackQuery: GetTrackQuery

  constructor(db: IDrizzleConnection) {
    this.getArtistQuery = new GetArtistQuery(db)
    this.getAllReleasesQuery = new GetAllReleasesQuery(db)
    this.getReleaseQuery = new GetReleaseQuery(db)
    this.getTrackQuery = new GetTrackQuery(db)
  }

  getArtist(id: number): Promise<GetArtistResult> {
    return this.getArtistQuery.execute(id)
  }

  getAllReleases(): Promise<GetAllReleasesResult> {
    return this.getAllReleasesQuery.execute()
  }

  getRelease(id: number): Promise<GetReleaseResult> {
    return this.getReleaseQuery.execute(id)
  }

  getTrack(id: number): Promise<GetTrackResult> {
    return this.getTrackQuery.execute(id)
  }
}
