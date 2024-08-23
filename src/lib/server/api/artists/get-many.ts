import type { IDrizzleConnection } from '$lib/server/db/connection'
import ArtistsDatabase, {
  type FindArtist,
  type FindInclude,
  type FindManySortField,
  type FindManySortOrder,
} from '$lib/server/db/controllers/artists'

export type GetManyArtistsParams<I extends FindInclude> = {
  skip?: number
  limit?: number
  include?: I[]
  filter?: {
    ids?: number[]
  }
  sort?: {
    field?: FindManySortField
    order?: FindManySortOrder
  }
}

export default async function getManyArtists<I extends FindInclude = never>(
  { skip = 0, limit, include = [], filter = {}, sort = {} }: GetManyArtistsParams<I>,
  dbConnection: IDrizzleConnection,
): Promise<{
  data: FindArtist<I>[]
  pagination: { skip: number; limit: number | undefined; total: number }
}> {
  const artistsDb = new ArtistsDatabase()

  const { results, total } = await artistsDb.findMany(
    { skip, limit, include, filter, sort },
    dbConnection,
  )

  return {
    data: results,
    pagination: { skip, limit, total },
  }
}
