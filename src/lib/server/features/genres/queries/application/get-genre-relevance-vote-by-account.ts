import { and, eq } from 'drizzle-orm'

import type { IDrizzleConnection } from '$lib/server/db/connection'
import { genreRelevanceVotes } from '$lib/server/db/schema'

export type GetGenreRelevanceVoteByAccountResult = {
  genreId: number
  accountId: number
  relevance: number
  createdAt: Date
  updatedAt: Date
}

export class GetGenreRelevanceVoteByAccountQuery {
  constructor(private db: IDrizzleConnection) {}

  async execute(
    genreId: number,
    accountId: number,
  ): Promise<GetGenreRelevanceVoteByAccountResult | undefined> {
    return this.db.query.genreRelevanceVotes.findFirst({
      where: and(
        eq(genreRelevanceVotes.genreId, genreId),
        eq(genreRelevanceVotes.accountId, accountId),
      ),
    })
  }
}
