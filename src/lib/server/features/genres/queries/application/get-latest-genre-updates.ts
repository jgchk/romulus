import { and, asc, desc, eq, lt } from 'drizzle-orm'

import type { IDrizzleConnection } from '$lib/server/db/connection'
import { genreHistory, genreHistoryAkas } from '$lib/server/db/schema'
import { ifDefined } from '$lib/utils/types'

export type GetLatestGenreUpdatesResult = {
  genre: {
    id: number
    name: string
    subtitle: string | null
    akas: string[]
    type: 'TREND' | 'SCENE' | 'STYLE' | 'META' | 'MOVEMENT'
    shortDescription: string | null
    longDescription: string | null
    nsfw: boolean
    notes: string | null
    parentGenreIds: number[]
    derivedFromGenreIds: number[]
    influencedByGenreIds: number[]
    treeGenreId: number
    createdAt: Date
    operation: 'CREATE' | 'UPDATE' | 'DELETE'
    accountId: number | null
    account: { id: number; username: string } | null
  }
  previousHistory:
    | {
        id: number
        name: string
        subtitle: string | null
        akas: string[]
        type: 'TREND' | 'SCENE' | 'STYLE' | 'META' | 'MOVEMENT'
        shortDescription: string | null
        longDescription: string | null
        nsfw: boolean
        notes: string | null
        parentGenreIds: number[]
        derivedFromGenreIds: number[]
        influencedByGenreIds: number[]
        treeGenreId: number
        createdAt: Date
        operation: 'CREATE' | 'UPDATE' | 'DELETE'
        accountId: number | null
      }
    | undefined
}[]

export class GetLatestGenreUpdatesQuery {
  constructor(private db: IDrizzleConnection) {}

  async execute(): Promise<GetLatestGenreUpdatesResult> {
    const results = await this.db.query.genreHistory.findMany({
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

    const history = await Promise.all(
      results.map(async (genre) => {
        const previousHistory = await this.db.query.genreHistory.findFirst({
          where: and(
            eq(genreHistory.treeGenreId, genre.treeGenreId),
            lt(genreHistory.createdAt, genre.createdAt),
          ),
          orderBy: desc(genreHistory.createdAt),
          with: {
            akas: {
              columns: { name: true },
              orderBy: [desc(genreHistoryAkas.relevance), asc(genreHistoryAkas.order)],
            },
          },
        })

        return {
          genre,
          previousHistory,
        }
      }),
    )

    return history.map(({ genre, previousHistory }) => ({
      genre: {
        ...genre,
        akas: genre.akas.map((aka) => aka.name),
        parentGenreIds: genre.parentGenreIds ?? [],
        derivedFromGenreIds: genre.derivedFromGenreIds ?? [],
        influencedByGenreIds: genre.influencedByGenreIds ?? [],
      },
      previousHistory: ifDefined(previousHistory, (ph) => ({
        ...ph,
        akas: ph.akas.map((aka) => aka.name),
        parentGenreIds: ph.parentGenreIds ?? [],
        derivedFromGenreIds: ph.derivedFromGenreIds ?? [],
        influencedByGenreIds: ph.influencedByGenreIds ?? [],
      })),
    }))
  }
}
