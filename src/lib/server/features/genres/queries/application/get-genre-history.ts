import { asc, desc } from 'drizzle-orm'

import type { IDrizzleConnection } from '$lib/server/db/connection'
import { genreHistory, genreHistoryAkas } from '$lib/server/db/schema'

export type GetGenreHistoryResult = {
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
  influencedByGenreIds: number[]
  treeGenreId: number
  createdAt: Date
  operation: 'CREATE' | 'UPDATE' | 'DELETE'
  accountId: number | null
  account: { id: number; username: string } | null
}[]

export class GetGenreHistoryQuery {
  constructor(private db: IDrizzleConnection) {}

  async execute(genreId: number): Promise<GetGenreHistoryResult> {
    const history = await this.db.query.genreHistory.findMany({
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

    return history.map((h) => ({
      ...h,
      akas: h.akas.map((a) => a.name),
      parentGenreIds: h.parentGenreIds ?? [],
      influencedByGenreIds: h.influencedByGenreIds ?? [],
    }))
  }
}
