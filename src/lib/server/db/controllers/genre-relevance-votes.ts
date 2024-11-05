import { eq } from 'drizzle-orm'
import { omit } from 'ramda'

import type { IDrizzleConnection } from '../connection'
import {
  type GenreRelevanceVote,
  genreRelevanceVotes,
  type InsertGenreRelevanceVote,
} from '../schema'

export class GenreRelevanceVotesDatabase {
  async upsert(
    data: InsertGenreRelevanceVote,
    conn: IDrizzleConnection,
  ): Promise<GenreRelevanceVote> {
    const [vote] = await conn
      .insert(genreRelevanceVotes)
      .values(data)
      .onConflictDoUpdate({
        target: [genreRelevanceVotes.genreId, genreRelevanceVotes.accountId],
        set: omit(['genreId', 'accountId'], data),
      })
      .returning()
    return vote
  }

  findByGenreId(genreId: number, conn: IDrizzleConnection): Promise<GenreRelevanceVote[]> {
    return conn.query.genreRelevanceVotes.findMany({
      where: eq(genreRelevanceVotes.genreId, genreId),
    })
  }
}
