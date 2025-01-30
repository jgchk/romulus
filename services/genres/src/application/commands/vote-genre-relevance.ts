import type { Result } from 'neverthrow'
import { err, errAsync, ok, okAsync, ResultAsync } from 'neverthrow'

import type { IAuthorizationService } from '../../domain/authorization.js'
import type { InvalidGenreRelevanceError } from '../../domain/errors/invalid-genre-relevance.js'
import { UnauthorizedError } from '../../domain/errors/unauthorized.js'
import { GenreRelevance } from '../../domain/genre-relevance.js'
import { GenreRelevanceVote } from '../../domain/genre-relevance-vote.js'
import type { GenreRelevanceVoteRepository } from '../../domain/genre-relevance-vote-repository.js'
import { GenresPermission } from '../../domain/permissions.js'
import { UNSET_GENRE_RELEVANCE } from '../../infrastructure/drizzle-schema.js'
import { median } from '../../utils.js'

export class VoteGenreRelevanceCommand {
  constructor(
    private genreRelevanceVoteRepo: GenreRelevanceVoteRepository,
    private authorization: IAuthorizationService,
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
      this.authorization.hasPermission(accountId, GenresPermission.VoteGenreRelevance),
    ).andThen((hasPermission) => {
      if (!hasPermission) return errAsync(new UnauthorizedError())
      return okAsync(undefined)
    })
  }
}
