import { and, asc, count, desc, eq, inArray, lt } from 'drizzle-orm'

import type { GenreOperation } from '$lib/types/genres'

import type { IDrizzleConnection } from '../connection'
import {
  type Account,
  type GenreHistory,
  genreHistory,
  type GenreHistoryAka,
  genreHistoryAkas,
  type InsertGenreHistory,
  type InsertGenreHistoryAka,
} from '../schema'

export type FindAllParams = {
  skip?: number
  limit?: number
  filter?: {
    accountId?: number
    operation?: GenreOperation
  }
}

export class GenreHistoryDatabase {
  insert(
    data: (InsertGenreHistory & { akas: Omit<InsertGenreHistoryAka, 'genreId'>[] })[],
    conn: IDrizzleConnection,
  ): Promise<GenreHistory[]> {
    return conn.transaction(async (tx) => {
      const values = await tx.insert(genreHistory).values(data).returning()

      const akas = data.flatMap((entry, i) =>
        entry.akas.map((aka) => ({ ...aka, genreId: values[i].id })),
      )

      if (akas.length > 0) {
        await tx.insert(genreHistoryAkas).values(akas)
      }

      return values
    })
  }

  findLatest(conn: IDrizzleConnection): Promise<
    (GenreHistory & {
      akas: Pick<GenreHistoryAka, 'name'>[]
      account: Pick<Account, 'id' | 'username'> | null
    })[]
  > {
    return conn.query.genreHistory.findMany({
      orderBy: (genreHistory, { desc }) => desc(genreHistory.createdAt),
      with: {
        akas: {
          columns: { name: true },
          orderBy: [desc(genreHistoryAkas.relevance), asc(genreHistoryAkas.order)],
        },
        account: {
          columns: {
            id: true,
            username: true,
          },
        },
      },
      limit: 100,
    })
  }

  findPreviousByGenreId(
    genreId: GenreHistory['treeGenreId'],
    createdAt: Date,
    conn: IDrizzleConnection,
  ): Promise<(GenreHistory & { akas: Pick<GenreHistoryAka, 'name'>[] }) | undefined> {
    return conn.query.genreHistory.findFirst({
      where: and(eq(genreHistory.treeGenreId, genreId), lt(genreHistory.createdAt, createdAt)),
      orderBy: desc(genreHistory.createdAt),
      with: {
        akas: {
          columns: { name: true },
          orderBy: [desc(genreHistoryAkas.relevance), asc(genreHistoryAkas.order)],
        },
      },
    })
  }

  findByGenreId(
    genreId: GenreHistory['treeGenreId'],
    conn: IDrizzleConnection,
  ): Promise<
    (GenreHistory & {
      akas: Pick<GenreHistoryAka, 'name'>[]
      account: Pick<Account, 'id' | 'username'> | null
    })[]
  > {
    return conn.query.genreHistory.findMany({
      where: (genreHistory, { eq }) => eq(genreHistory.treeGenreId, genreId),
      orderBy: asc(genreHistory.createdAt),
      with: {
        akas: {
          columns: { name: true },
          orderBy: [desc(genreHistoryAkas.relevance), asc(genreHistoryAkas.order)],
        },
        account: {
          columns: {
            id: true,
            username: true,
          },
        },
      },
    })
  }

  findByAccountId(
    accountId: NonNullable<GenreHistory['accountId']>,
    conn: IDrizzleConnection,
  ): Promise<
    Pick<
      GenreHistory,
      'id' | 'name' | 'type' | 'subtitle' | 'operation' | 'createdAt' | 'treeGenreId' | 'nsfw'
    >[]
  > {
    return conn.query.genreHistory.findMany({
      where: eq(genreHistory.accountId, accountId),
      columns: {
        id: true,
        name: true,
        type: true,
        subtitle: true,
        operation: true,
        createdAt: true,
        treeGenreId: true,
        nsfw: true,
      },
      orderBy: desc(genreHistory.createdAt),
    })
  }

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
