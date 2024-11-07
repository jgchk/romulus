import { inArray } from 'drizzle-orm'

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
  async deleteByGenreIds(
    genreIds: GenreHistory['treeGenreId'][],
    conn: IDrizzleConnection,
  ): Promise<void> {
    if (genreIds.length === 0) return
    await conn.delete(genreHistory).where(inArray(genreHistory.treeGenreId, genreIds))
  }
}
