import { UNSET_GENRE_RELEVANCE } from '$lib/types/genres'
import { median } from '$lib/utils/math'

import type { InvalidGenreRelevanceError } from '../../domain/genre-relevance-vote'
import { GenreRelevance, GenreRelevanceVote } from '../../domain/genre-relevance-vote'
import type { GenreRelevanceVoteRepository } from '../../domain/genre-relevance-vote-repository'

export class VoteGenreRelevanceCommand {
  constructor(private genreRelevanceVoteRepo: GenreRelevanceVoteRepository) {}

  async execute(
    genreId: number,
    relevance: number,
    accountId: number,
  ): Promise<void | InvalidGenreRelevanceError> {
    if (relevance === UNSET_GENRE_RELEVANCE) {
      // TODO: remove UNSET_GENRE_RELEVANCE from everything but the infrastructure layer. move this implicit deletion to an explicit delete command
      await this.genreRelevanceVoteRepo.delete(genreId, accountId)
    } else {
      const genreRelevance = GenreRelevance.create(relevance)
      if (genreRelevance instanceof Error) {
        return genreRelevance
      }

      const relevanceVote = new GenreRelevanceVote(genreId, accountId, genreRelevance)

      await this.genreRelevanceVoteRepo.save(relevanceVote)
    }

    const allRelevanceVotes = await this.genreRelevanceVoteRepo.findByGenreId(genreId)

    const newRelevance = this.calculateRelevance(allRelevanceVotes)
    if (newRelevance instanceof Error) {
      return newRelevance
    }

    await this.genreRelevanceVoteRepo.saveRelevance(genreId, newRelevance)
  }

  private calculateRelevance(
    genreVotes: GenreRelevanceVote[],
  ): GenreRelevance | InvalidGenreRelevanceError | undefined {
    if (genreVotes.length === 0) return undefined

    const relevances = genreVotes.map((genreVote) => genreVote.relevance.relevance)
    const relevance = Math.round(median(relevances))

    return GenreRelevance.create(relevance)
  }
}
