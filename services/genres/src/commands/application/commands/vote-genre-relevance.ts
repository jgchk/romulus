import type { IAuthorizationApplication } from '@romulus/authorization'

import { UnauthorizedError } from '../../../shared/domain/unauthorized'
import { UNSET_GENRE_RELEVANCE } from '../../../shared/infrastructure/drizzle-schema'
import { median } from '../../../utils'
import type { InvalidGenreRelevanceError } from '../../domain/errors/invalid-genre-relevance'
import { GenreRelevance } from '../../domain/genre-relevance'
import { GenreRelevanceVote } from '../../domain/genre-relevance-vote'
import type { GenreRelevanceVoteRepository } from '../../domain/genre-relevance-vote-repository'
import { GenresPermission } from '../../domain/permissions'

export class VoteGenreRelevanceCommand {
  constructor(
    private genreRelevanceVoteRepo: GenreRelevanceVoteRepository,
    private authorization: IAuthorizationApplication,
  ) {}

  async execute(
    genreId: number,
    relevance: number,
    accountId: number,
  ): Promise<void | UnauthorizedError | InvalidGenreRelevanceError> {
    const hasPermission = await this.authorization.hasPermission(
      accountId,
      GenresPermission.VoteGenreRelevance,
    )
    if (!hasPermission) return new UnauthorizedError()

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
