import { intersection, uniq } from 'ramda'

import type { IDrizzleConnection } from '$lib/server/db/connection'
import ReleaseArtistsDatabase from '$lib/server/db/controllers/release-artists'
import ReleasesDatabase, {
  type FindInclude,
  type FindManyParams,
  type FindManySortField,
  type FindManySortOrder,
  type FindRelease,
} from '$lib/server/db/controllers/releases'

export type GetManyReleasesParams<I extends FindInclude> = {
  skip?: number
  limit?: number
  include?: I[]
  filter?: {
    artists?: number[]
  }
  sort?: {
    field?: FindManySortField
    order?: FindManySortOrder
  }
}

export default async function getManyReleases<I extends FindInclude = never>(
  { skip = 0, limit, include = [], filter = {}, sort = {} }: GetManyReleasesParams<I>,
  dbConnection: IDrizzleConnection,
): Promise<{
  data: FindRelease<I>[]
  pagination: { skip: number; limit: number | undefined; total: number }
}> {
  const releasesDb = new ReleasesDatabase()

  const filter_: FindManyParams<I>['filter'] = {}

  if (filter.artists !== undefined) {
    const ids = await getArtistsFilterReleaseIds(filter.artists, dbConnection)
    filter_.ids = ids
  }

  const { results, total } = await releasesDb.findMany(
    { skip, limit, include, filter: filter_, sort },
    dbConnection,
  )

  return {
    data: results,
    pagination: { skip, limit, total },
  }
}

async function getArtistsFilterReleaseIds(artists: number[], dbConnection: IDrizzleConnection) {
  const releaseArtistsDb = new ReleaseArtistsDatabase()
  const releasesForEachArtist = await Promise.all(
    artists.map(async (artistId) => {
      const releaseArtists = await releaseArtistsDb.findByArtistId(artistId, dbConnection)
      const releases = uniq(releaseArtists.map((ra) => ra.releaseId))
      return releases
    }),
  )
  const commonReleases = releasesForEachArtist.reduce((acc, val) => intersection(acc, val))
  return commonReleases
}
