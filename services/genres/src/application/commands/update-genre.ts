import type { Result } from 'neverthrow'
import { err, errAsync, ok, okAsync, ResultAsync } from 'neverthrow'

import type { IAuthorizationService } from '../../domain/authorization'
import type { DerivedChildError } from '../../domain/errors/derived-child'
import type { DerivedInfluenceError } from '../../domain/errors/derived-influence'
import type { DuplicateAkaError } from '../../domain/errors/duplicate-aka'
import type { GenreCycleError } from '../../domain/errors/genre-cycle'
import type { SelfInfluenceError } from '../../domain/errors/self-influence'
import { UnauthorizedError } from '../../domain/errors/unauthorized'
import type { GenreUpdate } from '../../domain/genre'
import { GenreHistory } from '../../domain/genre-history'
import type { GenreHistoryRepository } from '../../domain/genre-history-repository'
import type { GenreRepository } from '../../domain/genre-repository'
import { GenreTreeNode } from '../../domain/genre-tree-node'
import type { GenreTreeRepository } from '../../domain/genre-tree-repository'
import { GenresPermission } from '../../domain/permissions'
import { GenreNotFoundError } from '../errors/genre-not-found'

export class UpdateGenreCommand {
  constructor(
    private genreRepo: GenreRepository,
    private genreTreeRepo: GenreTreeRepository,
    private genreHistoryRepo: GenreHistoryRepository,
    private authorization: IAuthorizationService,
  ) {}

  async execute(
    id: number,
    data: GenreUpdate,
    accountId: number,
  ): Promise<
    Result<
      void,
      | UnauthorizedError
      | GenreNotFoundError
      | DuplicateAkaError
      | DerivedChildError
      | DerivedInfluenceError
      | SelfInfluenceError
      | GenreCycleError
    >
  > {
    const hasPermission = await this.checkPermission(accountId)
    if (hasPermission.isErr()) return err(hasPermission.error)

    const genre = await this.genreRepo.findById(id)
    if (!genre) {
      return err(new GenreNotFoundError())
    }

    const updatedGenreResult = genre.withUpdate(data)
    if (updatedGenreResult.isErr()) {
      return err(updatedGenreResult.error)
    }
    const updatedGenre = updatedGenreResult.value

    const genreTree = await this.genreTreeRepo.get()
    const genreParents = data.parents ?? genreTree.getParents(id)
    const genreDerivedFrom = data.derivedFrom ?? genreTree.getDerivedFrom(id)
    const genreInfluences = data.influences ?? genreTree.getInfluences(id)

    const lastGenreHistory = await this.genreHistoryRepo.findLatestByGenreId(id)
    if (
      lastGenreHistory &&
      !updatedGenre.isChangedFrom(genreParents, genreDerivedFrom, genreInfluences, lastGenreHistory)
    ) {
      return ok(undefined)
    }

    const genreTreeNodeResult = GenreTreeNode.create(
      id,
      updatedGenre.name,
      genreParents,
      genreDerivedFrom,
      genreInfluences,
    )
    if (genreTreeNodeResult.isErr()) {
      return err(genreTreeNodeResult.error)
    }
    const genreTreeNode = genreTreeNodeResult.value

    const updateTreeResult = genreTree.updateGenre(genreTreeNode)
    if (updateTreeResult.isErr()) {
      return err(updateTreeResult.error)
    }

    await this.genreRepo.save(updatedGenre)

    await this.genreTreeRepo.save(genreTree)

    const genreHistory = GenreHistory.fromGenre(
      id,
      updatedGenre,
      genreTree.getParents(id),
      genreTree.getDerivedFrom(id),
      genreTree.getInfluences(id),
      'UPDATE',
      accountId,
    )
    await this.genreHistoryRepo.create(genreHistory)

    return ok(undefined)
  }

  private checkPermission(accountId: number) {
    return ResultAsync.fromSafePromise(
      this.authorization.hasPermission(accountId, GenresPermission.EditGenres),
    ).andThen((hasPermission) => {
      if (!hasPermission) return errAsync(new UnauthorizedError())
      return okAsync(undefined)
    })
  }
}
