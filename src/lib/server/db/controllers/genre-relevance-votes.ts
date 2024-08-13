import { and, eq } from 'drizzle-orm'
import { omit } from 'ramda'

import type { IDrizzleConnection } from '../connection'
import {
  type GenreRelevanceVote,
  genreRelevanceVotes,
  type InsertGenreRelevanceVote,
} from '../schema'

export type IGenreRelevanceVotesDatabase<T> = {
  upsert: (data: InsertGenreRelevanceVote, conn: T) => Promise<GenreRelevanceVote>
  findByGenreId: (genreId: number, conn: T) => Promise<GenreRelevanceVote[]>
  findByGenreIdAndAccountId: (
    genreId: GenreRelevanceVote['genreId'],
    accountId: GenreRelevanceVote['accountId'],
    conn: T,
  ) => Promise<GenreRelevanceVote | undefined>
  deleteByGenreId: (genreId: GenreRelevanceVote['genreId'], conn: T) => Promise<void>
}

export class GenreRelevanceVotesDatabase
  implements IGenreRelevanceVotesDatabase<IDrizzleConnection>
{
  async upsert(data: InsertGenreRelevanceVote, conn: IDrizzleConnection) {
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

  findByGenreId(genreId: number, conn: IDrizzleConnection) {
    return conn.query.genreRelevanceVotes.findMany({
      where: eq(genreRelevanceVotes.genreId, genreId),
    })
  }

  findByGenreIdAndAccountId(
    genreId: GenreRelevanceVote['genreId'],
    accountId: GenreRelevanceVote['accountId'],
    conn: IDrizzleConnection,
  ) {
    return conn.query.genreRelevanceVotes.findFirst({
      where: and(
        eq(genreRelevanceVotes.genreId, genreId),
        eq(genreRelevanceVotes.accountId, accountId),
      ),
    })
  }

  async deleteByGenreId(genreId: GenreRelevanceVote['genreId'], conn: IDrizzleConnection) {
    await conn.delete(genreRelevanceVotes).where(eq(genreRelevanceVotes.genreId, genreId))
  }
}
