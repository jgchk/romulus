import { and, count, eq, inArray } from 'drizzle-orm'

import type { GenreOperation } from '$lib/types/genres'

import type { IDrizzleConnection } from '../connection'
import { type GenreHistory, genreHistory } from '../schema'

export type FindAllParams = {
  skip?: number
  limit?: number
  filter?: {
    accountId?: number
    operation?: GenreOperation
  }
}

export class GenreHistoryDatabase {
  async findAll(
    { skip, limit, filter = {} }: FindAllParams,
    conn: IDrizzleConnection,
  ): Promise<{ results: GenreHistory[]; total: number }> {
    const wheres = []
    if (filter.accountId !== undefined) {
      wheres.push(eq(genreHistory.accountId, filter.accountId))
    }
    if (filter.operation !== undefined) {
      wheres.push(eq(genreHistory.operation, filter.operation))
    }
    const where = wheres.length > 0 ? and(...wheres) : undefined

    const dataQuery = conn.query.genreHistory.findMany({
      where,
      offset: skip,
      limit,
    })
    const totalQuery = conn.select({ total: count() }).from(genreHistory).where(where).$dynamic()

    const queryResults = limit === 0 ? [] : await dataQuery.execute()
    const totalResults = await totalQuery.execute()

    return {
      results: queryResults,
      total: totalResults.length > 0 ? totalResults[0].total : 0,
    }
  }

  async deleteByGenreIds(
    genreIds: GenreHistory['treeGenreId'][],
    conn: IDrizzleConnection,
  ): Promise<void> {
    if (genreIds.length === 0) return
    await conn.delete(genreHistory).where(inArray(genreHistory.treeGenreId, genreIds))
  }
}
