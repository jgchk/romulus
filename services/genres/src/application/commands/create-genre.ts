import { errAsync, ok, okAsync, Result, ResultAsync } from 'neverthrow'

import type { IAuthorizationService } from '../../domain/authorization.js'
import { UnauthorizedError } from '../../domain/errors/unauthorized.js'
import { Genre } from '../../domain/genre.js'
import { GenreHistory } from '../../domain/genre-history.js'
import type { GenreHistoryRepository } from '../../domain/genre-history-repository.js'
import type { GenreRepository } from '../../domain/genre-repository.js'
import { GenreTreeNode } from '../../domain/genre-tree-node.js'
import type { GenreTreeRepository } from '../../domain/genre-tree-repository.js'
import { GenresPermission } from '../../domain/permissions.js'

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
    private authorization: IAuthorizationService,
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
      this.authorization.hasPermission(accountId, GenresPermission.CreateGenres),
    ).andThen((hasPermission) => {
      if (!hasPermission) return errAsync(new UnauthorizedError())
      return okAsync(undefined)
    })
  }
}
