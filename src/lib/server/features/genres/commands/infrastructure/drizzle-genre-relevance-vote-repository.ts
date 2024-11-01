import type { IDrizzleConnection } from '$lib/server/db/connection'
import { genreRelevanceVotes } from '$lib/server/db/schema'

import type { GenreRelevanceVoteRepository } from '../domain/genre-relevance-vote-repository'

export class DrizzleGenreRelevanceVoteRepository implements GenreRelevanceVoteRepository {
  constructor(private db: IDrizzleConnection) {}

  async save(genreId: number, accountId: number, relevance: number): Promise<void> {
    await this.db
      .insert(genreRelevanceVotes)
      .values({
        genreId,
        accountId,
        relevance,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [genreRelevanceVotes.genreId, genreRelevanceVotes.accountId],
        set: {
          relevance,
          updatedAt: new Date(),
        },
      })
  }
}
