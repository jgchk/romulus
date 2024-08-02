import type { IDrizzleConnection } from '$lib/server/db/connection'
import { type FindAllInclude, GenresDatabase } from '$lib/server/db/controllers/genre'
import { GenreHistoryDatabase } from '$lib/server/db/controllers/genre-history'

export type GetManyGenresParams<I extends FindAllInclude> = {
  skip?: number
  limit?: number
  include?: I[]
  filter?: {
    createdBy?: number
  }
}

export default async function getManyGenres<I extends FindAllInclude = never>(
  { skip = 0, limit = 10, include = [], filter = {} }: GetManyGenresParams<I>,
  dbConnection: IDrizzleConnection,
) {
  const genresDb = new GenresDatabase()

  if (filter.createdBy !== undefined) {
    const genreHistoryDb = new GenreHistoryDatabase()
    const { results: history } = await genreHistoryDb.findAll(
      { filter: { accountId: filter.createdBy } },
      dbConnection,
    )

    const { results, total } = await genresDb.findAll(
      { skip, limit, include, filter: { ids: history.map((h) => h.treeGenreId) } },
      dbConnection,
    )

    return {
      data: results,
      pagination: { skip, limit, total },
    }
  }

  const { results, total } = await genresDb.findAll({ skip, limit, include }, dbConnection)

  return {
    data: results,
    pagination: { skip, limit, total },
  }
}
