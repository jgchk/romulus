import { and, eq } from 'drizzle-orm'

import { GenreRelevance } from '../domain/genre-relevance.js'
import { GenreRelevanceVote } from '../domain/genre-relevance-vote.js'
import { type GenreRelevanceVoteRepository } from '../domain/genre-relevance-vote-repository.js'
import { type IDrizzleConnection } from './drizzle-database.js'
import { genreRelevanceVotes, genres, UNSET_GENRE_RELEVANCE } from './drizzle-schema.js'

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
      if (relevance.isErr()) {
        console.error(
          `Error while reconstructing GenreRelevanceVotes in DrizzleGenreRelevanceVoteRepository.findByGenreId(). Invalid relevance for DB entry ${JSON.stringify(result)}. ${relevance.error.message}`,
        )
        continue
      }

      const vote = new GenreRelevanceVote(result.genreId, result.accountId, relevance.value)
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
