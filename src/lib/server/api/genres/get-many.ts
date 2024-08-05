import { clamp } from 'ramda'

import type { IDrizzleConnection } from '$lib/server/db/connection'
import { type FindAllInclude, GenresDatabase } from '$lib/server/db/controllers/genre'
import { GenreHistoryDatabase } from '$lib/server/db/controllers/genre-history'
import type { GenreType } from '$lib/types/genres'

export type GetManyGenresParams<I extends FindAllInclude> = {
  skip?: number
  limit?: number
  include?: I[]
  filter?: {
    name?: string
    subtitle?: string | null
    type?: GenreType
    relevance?: number | null
    nsfw?: boolean
    shortDescription?: string | null
    longDescription?: string | null
    notes?: string | null
    createdAt?: Date
    updatedAt?: Date
    createdBy?: number
  }
}

export default async function getManyGenres<I extends FindAllInclude = never>(
  params: GetManyGenresParams<I>,
  dbConnection: IDrizzleConnection,
) {
  const { skip = 0, include = [], filter = {} } = params
  const limit = clamp(0, 100, params.limit ?? 10)

  const genresDb = new GenresDatabase()

  if (filter.createdBy !== undefined) {
    const genreHistoryDb = new GenreHistoryDatabase()
    const { results: history } = await genreHistoryDb.findAll(
      { filter: { accountId: filter.createdBy } },
      dbConnection,
    )

    const { results, total } = await genresDb.findAll(
      { skip, limit, include, filter: { ...filter, ids: history.map((h) => h.treeGenreId) } },
      dbConnection,
    )

    return {
      data: results,
      pagination: { skip, limit, total },
    }
  }

  const { results, total } = await genresDb.findAll({ skip, limit, include, filter }, dbConnection)

  return {
    data: results,
    pagination: { skip, limit, total },
  }
}
