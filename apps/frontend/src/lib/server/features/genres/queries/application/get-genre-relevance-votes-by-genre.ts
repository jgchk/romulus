import { eq } from 'drizzle-orm'

import type { IDrizzleConnection } from '$lib/server/db/connection'
import { genreRelevanceVotes } from '$lib/server/db/schema'

export type GetGenreRelevanceVotesByGenreResult = {
  genreId: number
  accountId: number
  relevance: number
  createdAt: Date
  updatedAt: Date
}[]

export class GetGenreRelevanceVotesByGenreQuery {
  constructor(private db: IDrizzleConnection) {}

  async execute(genreId: number): Promise<GetGenreRelevanceVotesByGenreResult> {
    return this.db.query.genreRelevanceVotes.findMany({
      where: eq(genreRelevanceVotes.genreId, genreId),
    })
  }
}
