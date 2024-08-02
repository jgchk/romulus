import type { IDrizzleConnection } from '$lib/server/db/connection'
import { type FindAllInclude, GenresDatabase } from '$lib/server/db/controllers/genre'

export type GetManyGenresParams<I extends FindAllInclude> = {
  skip?: number
  limit?: number
  include?: I[]
}

export default async function getManyGenres<I extends FindAllInclude = never>(
  { skip = 0, limit = 10, include = [] }: GetManyGenresParams<I>,
  dbConnection: IDrizzleConnection,
) {
  const genresDb = new GenresDatabase()

  const { results, total } = await genresDb.findAll({ skip, limit, include }, dbConnection)

  return {
    data: results,
    pagination: { skip, limit, total },
  }
}
