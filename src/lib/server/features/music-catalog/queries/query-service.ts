import type { IDrizzleConnection } from '$lib/server/db/connection'

import { GetAllArtistsQuery } from './application/get-all-artists'
import { GetAllReleasesQuery } from './application/get-all-releases'
import { GetArtistQuery } from './application/get-artist'
import { GetReleaseQuery } from './application/get-release'
import { GetTrackQuery } from './application/get-track'
import { SearchArtistsQuery } from './application/search-artists'
import { SearchTracksQuery } from './application/search-tracks'

export class MusicCatalogQueryService {
  private getAllArtistsQuery: GetAllArtistsQuery
  private searchArtistsQuery: SearchArtistsQuery
  private getArtistQuery: GetArtistQuery
  private getAllReleasesQuery: GetAllReleasesQuery
  private getReleaseQuery: GetReleaseQuery
  private getTrackQuery: GetTrackQuery
  private searchTracksQuery: SearchTracksQuery

  constructor(db: IDrizzleConnection) {
    this.getAllArtistsQuery = new GetAllArtistsQuery(db)
    this.searchArtistsQuery = new SearchArtistsQuery(db)
    this.getArtistQuery = new GetArtistQuery(db)
    this.getAllReleasesQuery = new GetAllReleasesQuery(db)
    this.getReleaseQuery = new GetReleaseQuery(db)
    this.getTrackQuery = new GetTrackQuery(db)
    this.searchTracksQuery = new SearchTracksQuery(db)
  }

  getAllArtists() {
    return this.getAllArtistsQuery.execute()
  }

  searchArtists(nameQuery: string) {
    return this.searchArtistsQuery.execute(nameQuery)
  }

  getArtist(id: number) {
    return this.getArtistQuery.execute(id)
  }

  getAllReleases() {
    return this.getAllReleasesQuery.execute()
  }

  getRelease(id: number) {
    return this.getReleaseQuery.execute(id)
  }

  getTrack(id: number) {
    return this.getTrackQuery.execute(id)
  }

  searchTracks(titleQuery: string) {
    return this.searchTracksQuery.execute(titleQuery)
  }
}
