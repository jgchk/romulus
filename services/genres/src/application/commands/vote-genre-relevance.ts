import type { AuthorizationApplication } from '@romulus/authorization/application'
import type { Result } from 'neverthrow'
import { err, errAsync, ok, okAsync, ResultAsync } from 'neverthrow'

import type { InvalidGenreRelevanceError } from '../../domain/errors/invalid-genre-relevance'
import { UnauthorizedError } from '../../domain/errors/unauthorized'
import { GenreRelevance } from '../../domain/genre-relevance'
import { GenreRelevanceVote } from '../../domain/genre-relevance-vote'
import type { GenreRelevanceVoteRepository } from '../../domain/genre-relevance-vote-repository'
import { GenresPermission } from '../../domain/permissions'
import { UNSET_GENRE_RELEVANCE } from '../../infrastructure/drizzle-schema'
import { median } from '../../utils'

export class VoteGenreRelevanceCommand {
  constructor(
    private genreRelevanceVoteRepo: GenreRelevanceVoteRepository,
    private authorization: AuthorizationApplication,
  ) {}

  async execute(
    genreId: number,
    relevance: number,
    accountId: number,
  ): Promise<Result<void, UnauthorizedError | InvalidGenreRelevanceError>> {
    const hasPermission = await this.checkPermission(accountId)
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

  private checkPermission(accountId: number) {
    return ResultAsync.fromSafePromise(
      this.authorization.checkMyPermission(GenresPermission.VoteGenreRelevance, accountId),
    ).andThen((hasPermission) => {
      if (!hasPermission) return errAsync(new UnauthorizedError())
      return okAsync(undefined)
    })
  }
}
