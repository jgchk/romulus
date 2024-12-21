import type { AuthorizationApplication } from '@romulus/authorization/application'
import { errAsync, ok, okAsync, Result, ResultAsync } from 'neverthrow'

import { UnauthorizedError } from '../../domain/errors/unauthorized'
import { Genre } from '../../domain/genre'
import { GenreHistory } from '../../domain/genre-history'
import type { GenreHistoryRepository } from '../../domain/genre-history-repository'
import type { GenreRepository } from '../../domain/genre-repository'
import { GenreTreeNode } from '../../domain/genre-tree-node'
import type { GenreTreeRepository } from '../../domain/genre-tree-repository'
import { GenresPermission } from '../../domain/permissions'

export type CreateGenreInput = {
  name: string
  subtitle?: string
  type: 'TREND' | 'SCENE' | 'STYLE' | 'META' | 'MOVEMENT'
  nsfw: boolean
  shortDescription?: string
  longDescription?: string
  notes?: string
  parents: Set<number>
  derivedFrom: Set<number>
  influences: Set<number>
  akas: {
    primary: string[]
    secondary: string[]
    tertiary: string[]
  }
  createdAt: Date
  updatedAt: Date
}

export class CreateGenreCommand {
  constructor(
    private genreRepo: GenreRepository,
    private genreTreeRepo: GenreTreeRepository,
    private genreHistoryRepo: GenreHistoryRepository,
    private authorization: AuthorizationApplication,
  ) {}

  async execute(data: CreateGenreInput, accountId: number) {
    return this.checkPermission(accountId)
      .andThen(() => Genre.create(data))
      .andThen((genre) => {
        const genreTreeNode = GenreTreeNode.create(
          -1,
          genre.name,
          data.parents,
          data.derivedFrom,
          data.influences,
        )
        return Result.combine([ok(genre), genreTreeNode])
      })
      .andThen(([genre, genreTreeNode]) =>
        ResultAsync.fromSafePromise(
          (async () => {
            const { id } = await this.genreRepo.save(genre)
            genreTreeNode.id = id

            const genreTree = await this.genreTreeRepo.get()
            genreTree.insertGenre(genreTreeNode)
            await this.genreTreeRepo.save(genreTree)

            const genreHistory = GenreHistory.fromGenre(
              id,
              genre,
              data.parents,
              data.derivedFrom,
              data.influences,
              'CREATE',
              accountId,
            )
            await this.genreHistoryRepo.create(genreHistory)

            return { id }
          })(),
        ),
      )
  }

  private checkPermission(accountId: number) {
    return ResultAsync.fromSafePromise(
      this.authorization.checkMyPermission(GenresPermission.CreateGenres, accountId),
    ).andThen((hasPermission) => {
      if (!hasPermission) return errAsync(new UnauthorizedError())
      return okAsync(undefined)
    })
  }
}
