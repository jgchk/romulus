import { and, eq } from 'drizzle-orm'
import { omit } from 'ramda'

import type { DbConnection } from '../connection'
import {
  type GenreRelevanceVote,
  genreRelevanceVotes,
  type InsertGenreRelevanceVote,
} from '../schema'

export interface IGenreRelevanceVotesDatabase {
  upsert: (data: InsertGenreRelevanceVote) => Promise<GenreRelevanceVote>
  findByGenreId: (genreId: number) => Promise<GenreRelevanceVote[]>
  findByGenreIdAndAccountId: (
    genreId: GenreRelevanceVote['genreId'],
    accountId: GenreRelevanceVote['accountId'],
  ) => Promise<GenreRelevanceVote | undefined>
  deleteByGenreId: (genreId: GenreRelevanceVote['genreId']) => Promise<void>
}

export class GenreRelevanceVotesDatabase implements IGenreRelevanceVotesDatabase {
  constructor(private db: DbConnection) {}

  async upsert(data: InsertGenreRelevanceVote) {
    const [vote] = await this.db
      .insert(genreRelevanceVotes)
      .values(data)
      .onConflictDoUpdate({
        target: [genreRelevanceVotes.genreId, genreRelevanceVotes.accountId],
        set: omit(['genreId', 'accountId'], data),
      })
      .returning()
    return vote
  }

  findByGenreId(genreId: number) {
    return this.db.query.genreRelevanceVotes.findMany({
      where: eq(genreRelevanceVotes.genreId, genreId),
    })
  }

  findByGenreIdAndAccountId(
    genreId: GenreRelevanceVote['genreId'],
    accountId: GenreRelevanceVote['accountId'],
  ) {
    return this.db.query.genreRelevanceVotes.findFirst({
      where: and(
        eq(genreRelevanceVotes.genreId, genreId),
        eq(genreRelevanceVotes.accountId, accountId),
      ),
    })
  }

  async deleteByGenreId(genreId: GenreRelevanceVote['genreId']) {
    await this.db.delete(genreRelevanceVotes).where(eq(genreRelevanceVotes.genreId, genreId))
  }
}
