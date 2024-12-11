import { asc, desc } from 'drizzle-orm'

import type { IDrizzleConnection } from '../../shared/infrastructure/drizzle-database'
import { genreHistory, genreHistoryAkas } from '../../shared/infrastructure/drizzle-schema'

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
  derivedFromGenreIds: number[]
  influencedByGenreIds: number[]
  treeGenreId: number
  createdAt: Date
  operation: 'CREATE' | 'UPDATE' | 'DELETE'
  accountId: number | null
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
      },
    })

    return history.map((h) => ({
      ...h,
      akas: h.akas.map((a) => a.name),
      parentGenreIds: h.parentGenreIds ?? [],
      derivedFromGenreIds: h.derivedFromGenreIds ?? [],
      influencedByGenreIds: h.influencedByGenreIds ?? [],
    }))
  }
}
