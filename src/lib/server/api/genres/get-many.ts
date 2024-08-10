import type { IDrizzleConnection } from '$lib/server/db/connection'
import {
  type FindAllGenre,
  type FindAllInclude,
  GenresDatabase,
} from '$lib/server/db/controllers/genre'
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
  sort?: {
    field?:
      | 'id'
      | 'name'
      | 'subtitle'
      | 'type'
      | 'relevance'
      | 'nsfw'
      | 'shortDescription'
      | 'longDescription'
    order?: 'asc' | 'desc'
  }
}

export default async function getManyGenres<I extends FindAllInclude = never>(
  { skip = 0, limit = 25, include = [], filter = {}, sort = {} }: GetManyGenresParams<I>,
  dbConnection: IDrizzleConnection,
): Promise<{
  data: FindAllGenre<I>[]
  pagination: { skip: number; limit: number; total: number }
}> {
  const genresDb = new GenresDatabase()

  if (filter.createdBy !== undefined) {
    const genreHistoryDb = new GenreHistoryDatabase()
    const { results: history } = await genreHistoryDb.findAll(
      { filter: { accountId: filter.createdBy, operation: 'CREATE' } },
      dbConnection,
    )

    const { results, total } = await genresDb.findAll(
      { skip, limit, include, filter: { ...filter, ids: history.map((h) => h.treeGenreId) }, sort },
      dbConnection,
    )

    return {
      data: results,
      pagination: { skip, limit, total },
    }
  }

  const { results, total } = await genresDb.findAll(
    { skip, limit, include, filter, sort },
    dbConnection,
  )

  return {
    data: results,
    pagination: { skip, limit, total },
  }
}
