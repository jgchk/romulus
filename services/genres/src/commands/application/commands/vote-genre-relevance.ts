import type { AuthorizationClientError, IAuthorizationClient } from '@romulus/authorization/client'
import type { Result } from 'neverthrow'
import { err, errAsync, ok, okAsync } from 'neverthrow'

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
    private authorization: IAuthorizationClient,
  ) {}

  async execute(
    genreId: number,
    relevance: number,
    accountId: number,
  ): Promise<
    Result<void, AuthorizationClientError | UnauthorizedError | InvalidGenreRelevanceError>
  > {
    const hasPermission = await this.checkPermission()
    if (hasPermission.isErr()) return err(hasPermission.error)

    if (relevance === UNSET_GENRE_RELEVANCE) {
      // TODO: remove UNSET_GENRE_RELEVANCE from everything but the infrastructure layer. move this implicit deletion to an explicit delete command
      await this.genreRelevanceVoteRepo.delete(genreId, accountId)
    } else {
      const genreRelevanceResult = GenreRelevance.create(relevance)
      if (genreRelevanceResult.isErr()) {
        return err(genreRelevanceResult.error)
      }
      const genreRelevance = genreRelevanceResult.value

      const relevanceVote = new GenreRelevanceVote(genreId, accountId, genreRelevance)

      await this.genreRelevanceVoteRepo.save(relevanceVote)
    }

    const allRelevanceVotes = await this.genreRelevanceVoteRepo.findByGenreId(genreId)

    const newRelevanceResult = this.calculateRelevance(allRelevanceVotes)
    if (newRelevanceResult.isErr()) {
      return err(newRelevanceResult.error)
    }
    const newRelevance = newRelevanceResult.value

    await this.genreRelevanceVoteRepo.saveRelevance(genreId, newRelevance)

    return ok(undefined)
  }

  private calculateRelevance(
    genreVotes: GenreRelevanceVote[],
  ): Result<GenreRelevance | undefined, InvalidGenreRelevanceError> {
    if (genreVotes.length === 0) return ok(undefined)

    const relevances = genreVotes.map((genreVote) => genreVote.relevance.relevance)
    const relevance = Math.round(median(relevances))

    return GenreRelevance.create(relevance)
  }

  private checkPermission() {
    return this.authorization
      .checkMyPermission(GenresPermission.VoteGenreRelevance)
      .andThen((hasPermission) => {
        if (!hasPermission) return errAsync(new UnauthorizedError())
        return okAsync(undefined)
      })
  }
}
