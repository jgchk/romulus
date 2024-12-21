import type { AuthorizationApplication } from '@romulus/authorization/application'
import { err, errAsync, ok, okAsync, ResultAsync } from 'neverthrow'

import { UnauthorizedError } from '../../domain/errors/unauthorized'
import { GenreHistory } from '../../domain/genre-history'
import type { GenreHistoryRepository } from '../../domain/genre-history-repository'
import type { GenreRepository } from '../../domain/genre-repository'
import type { GenreTreeRepository } from '../../domain/genre-tree-repository'
import { GenresPermission } from '../../domain/permissions'
import { GenreNotFoundError } from '../errors/genre-not-found'

export class DeleteGenreCommand {
  constructor(
    private genreRepo: GenreRepository,
    private genreTreeRepo: GenreTreeRepository,
    private genreHistoryRepo: GenreHistoryRepository,
    private authorization: AuthorizationApplication,
  ) {}

  async execute(id: number, accountId: number) {
    return this.checkPermission(accountId)
      .andThen(() => ResultAsync.fromSafePromise(this.genreRepo.findById(id)))
      .andThen((genre) => {
        if (genre === undefined) return err(new GenreNotFoundError())
        return ok(genre)
      })
      .andThen((genre) =>
        ResultAsync.fromSafePromise(
          (async () => {
            const genreTree = await this.genreTreeRepo.get()

            const genreParentsBeforeDeletion = genreTree.getParents(id)
            const genreDerivedFromBeforeDeletion = genreTree.getDerivedFrom(id)
            const genreInfluencesBeforeDeletion = genreTree.getInfluences(id)

            const childrenIds = genreTree.getGenreChildren(id)
            genreTree.deleteGenre(id)

            await this.genreTreeRepo.save(genreTree)

            await this.genreRepo.delete(id)

            const genreHistory = GenreHistory.fromGenre(
              id,
              genre,
              genreParentsBeforeDeletion,
              genreDerivedFromBeforeDeletion,
              genreInfluencesBeforeDeletion,
              'DELETE',
              accountId,
            )
            await this.genreHistoryRepo.create(genreHistory)

            // save genre history for all children
            await Promise.all(
              [...childrenIds].map(async (childId) => {
                const child = await this.genreRepo.findById(childId)
                if (!child) return

                const childHistory = GenreHistory.fromGenre(
                  childId,
                  child,
                  genreTree.getParents(childId),
                  genreTree.getDerivedFrom(childId),
                  genreTree.getInfluences(childId),
                  'UPDATE',
                  accountId,
                )
                await this.genreHistoryRepo.create(childHistory)
              }),
            )
          })(),
        ),
      )
  }

  private checkPermission(accountId: number) {
    return ResultAsync.fromSafePromise(
      this.authorization.checkMyPermission(GenresPermission.DeleteGenres, accountId),
    ).andThen((hasPermission) => {
      if (!hasPermission) return errAsync(new UnauthorizedError())
      return okAsync(undefined)
    })
  }
}
