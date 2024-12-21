import { eq } from 'drizzle-orm'

import type { IDrizzleConnection } from '../../infrastructure/drizzle-database'
import { genreRelevanceVotes } from '../../infrastructure/drizzle-schema'

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
