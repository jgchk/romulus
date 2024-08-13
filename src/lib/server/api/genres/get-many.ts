import { intersection } from 'ramda'

import type { IDrizzleConnection } from '$lib/server/db/connection'
import {
  type FindAllGenre,
  type FindAllInclude,
  type FindAllParams,
  type FindAllSortField,
  type FindAllSortOrder,
  GenresDatabase,
} from '$lib/server/db/controllers/genre'
import { GenreHistoryDatabase } from '$lib/server/db/controllers/genre-history'
import { GenreParentsDatabase } from '$lib/server/db/controllers/genre-parents'
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
    parents?: number[]
  }
  sort?: {
    field?: FindAllSortField
    order?: FindAllSortOrder
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

  const filter_: FindAllParams<I>['filter'] = filter

  if (filter.createdBy !== undefined) {
    const ids = await getCreatedByFilterGenreIds(filter.createdBy, dbConnection)
    filter_.ids = ids
  }

  if (filter.parents !== undefined) {
    const ids = await getParentsFilterGenreIds(filter.parents, dbConnection)
    if (filter_.ids !== undefined) {
      filter_.ids = intersection(filter_.ids, ids)
    } else {
      filter_.ids = ids
    }
  }

  const { results, total } = await genresDb.findAll(
    { skip, limit, include, filter: filter_, sort },
    dbConnection,
  )

  return {
    data: results,
    pagination: { skip, limit, total },
  }
}

async function getCreatedByFilterGenreIds(
  accountId: number,
  dbConnection: IDrizzleConnection,
): Promise<number[]> {
  const genreHistoryDb = new GenreHistoryDatabase()
  const { results: history } = await genreHistoryDb.findAll(
    { filter: { accountId, operation: 'CREATE' } },
    dbConnection,
  )
  return history.map((h) => h.treeGenreId)
}

async function getParentsFilterGenreIds(
  parents: number[],
  dbConnection: IDrizzleConnection,
): Promise<number[]> {
  const genreParentsDb = new GenreParentsDatabase()
  const allParentChildren = await Promise.all(
    parents.map((parentId) => genreParentsDb.findByParentId(parentId, dbConnection)),
  )
  const childIds = allParentChildren
    .map((parentChildren) => parentChildren.map((child) => child.childId))
    .reduce((acc, val) => intersection(acc, val))
  return childIds
}
