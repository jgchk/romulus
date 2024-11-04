import { and, eq } from 'drizzle-orm'

import type { IDrizzleConnection } from '$lib/server/db/connection'
import { genreRelevanceVotes, genres } from '$lib/server/db/schema'
import { UNSET_GENRE_RELEVANCE } from '$lib/types/genres'

import {
  GenreRelevance,
  GenreRelevanceVote,
  InvalidGenreRelevanceError,
} from '../domain/genre-relevance-vote'
import type { GenreRelevanceVoteRepository } from '../domain/genre-relevance-vote-repository'

export class DrizzleGenreRelevanceVoteRepository implements GenreRelevanceVoteRepository {
  constructor(private db: IDrizzleConnection) {}

  async save(genreRelevanceVote: GenreRelevanceVote): Promise<void> {
    await this.db
      .insert(genreRelevanceVotes)
      .values({
        genreId: genreRelevanceVote.genreId,
        accountId: genreRelevanceVote.accountId,
        relevance: genreRelevanceVote.relevance.relevance,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [genreRelevanceVotes.genreId, genreRelevanceVotes.accountId],
        set: {
          relevance: genreRelevanceVote.relevance.relevance,
          updatedAt: new Date(),
        },
      })
  }

  async delete(genreId: number, accountId: number): Promise<void> {
    await this.db
      .delete(genreRelevanceVotes)
      .where(
        and(eq(genreRelevanceVotes.genreId, genreId), eq(genreRelevanceVotes.accountId, accountId)),
      )
  }

  async findByGenreId(genreId: number): Promise<GenreRelevanceVote[]> {
    const results = await this.db.query.genreRelevanceVotes.findMany({
      where: (genreRelevanceVotes, { eq }) => eq(genreRelevanceVotes.genreId, genreId),
    })

    const votes: GenreRelevanceVote[] = []

    for (const result of results) {
      const relevance = GenreRelevance.create(result.relevance)
      if (relevance instanceof InvalidGenreRelevanceError) {
        console.error(
          `Error while reconstructing GenreRelevanceVotes in DrizzleGenreRelevanceVoteRepository.findByGenreId(). Invalid relevance for DB entry ${JSON.stringify(result)}. ${relevance.message}`,
        )
        continue
      }

      const vote = new GenreRelevanceVote(result.genreId, result.accountId, relevance)
      votes.push(vote)
    }

    return votes
  }

  async saveRelevance(genreId: number, relevance: GenreRelevance | undefined): Promise<void> {
    await this.db
      .update(genres)
      .set({ relevance: relevance?.relevance ?? UNSET_GENRE_RELEVANCE })
      .where(eq(genres.id, genreId))
  }
}
