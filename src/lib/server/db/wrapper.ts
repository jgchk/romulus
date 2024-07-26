import { and, asc, desc, eq, lt } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'

import * as schema from './schema'
import {
  type Account,
  type GenreHistory,
  genreHistory,
  type GenreHistoryAka,
  genreHistoryAkas,
  type InsertGenreHistory,
  type InsertGenreHistoryAka,
} from './schema'

export interface IDatabase {
  transaction<T>(fn: (db: IDatabase) => Promise<T>): Promise<T>
  genreHistory: IGenreHistoryDatabase
}

export interface IGenreHistoryDatabase {
  insert: (
    ...data: (InsertGenreHistory & { akas: Omit<InsertGenreHistoryAka, 'genreId'>[] })[]
  ) => Promise<GenreHistory[]>
  findLatest: () => Promise<
    (GenreHistory & {
      akas: Pick<GenreHistoryAka, 'name'>[]
      account: Pick<Account, 'id' | 'username'> | null
    })[]
  >
  findLatestByGenreId: (
    genreId: GenreHistory['treeGenreId'],
  ) => Promise<
    (GenreHistory & { akas: Pick<GenreHistoryAka, 'name' | 'relevance' | 'order'>[] }) | undefined
  >
  findPreviousByGenreId: (
    genreId: GenreHistory['treeGenreId'],
    createdAt: Date,
  ) => Promise<(GenreHistory & { akas: Pick<GenreHistoryAka, 'name'>[] }) | undefined>
  findByGenreId: (genreId: GenreHistory['treeGenreId']) => Promise<
    (GenreHistory & {
      akas: Pick<GenreHistoryAka, 'name'>[]
      account: Pick<Account, 'id' | 'username'> | null
    })[]
  >
  findByAccountId: (
    accountId: NonNullable<GenreHistory['accountId']>,
  ) => Promise<
    Pick<
      GenreHistory,
      'id' | 'name' | 'type' | 'subtitle' | 'operation' | 'createdAt' | 'treeGenreId' | 'nsfw'
    >[]
  >
}

export class Database implements IDatabase {
  readonly db: PostgresJsDatabase<typeof schema>

  constructor(db: PostgresJsDatabase<typeof schema>) {
    this.db = db
  }

  async transaction<T>(fn: (db: IDatabase) => Promise<T>): Promise<T> {
    return this.db.transaction((tx) => fn(new Database(tx)))
  }

  genreHistory: IGenreHistoryDatabase = {
    insert: async (...data) =>
      this.db.transaction(async (tx) => {
        const values = await tx.insert(genreHistory).values(data).returning()

        const akas = data.flatMap((entry, i) =>
          entry.akas.map((aka) => ({ ...aka, genreId: values[i].id })),
        )

        if (akas.length > 0) {
          await tx.insert(genreHistoryAkas).values(akas)
        }

        return values
      }),

    findLatest: () =>
      this.db.query.genreHistory.findMany({
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
      }),

    findLatestByGenreId: (genreId) =>
      this.db.query.genreHistory.findFirst({
        where: eq(genreHistory.treeGenreId, genreId),
        orderBy: desc(genreHistory.createdAt),
        with: {
          akas: {
            columns: {
              name: true,
              relevance: true,
              order: true,
            },
            orderBy: [desc(genreHistoryAkas.relevance), asc(genreHistoryAkas.order)],
          },
        },
      }),

    findPreviousByGenreId: (genreId, createdAt) =>
      this.db.query.genreHistory.findFirst({
        where: and(eq(genreHistory.treeGenreId, genreId), lt(genreHistory.createdAt, createdAt)),
        orderBy: desc(genreHistory.createdAt),
        with: {
          akas: {
            columns: { name: true },
            orderBy: [desc(genreHistoryAkas.relevance), asc(genreHistoryAkas.order)],
          },
        },
      }),

    findByGenreId: (genreId) =>
      this.db.query.genreHistory.findMany({
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
      }),

    findByAccountId: (accountId) =>
      this.db.query.genreHistory.findMany({
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
      }),
  }
}
