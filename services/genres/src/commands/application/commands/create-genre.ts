import type { IAuthorizationApplication } from '@romulus/authorization'

import { UnauthorizedError } from '../../../shared/domain/unauthorized'
import type { DerivedChildError } from '../../domain/errors/derived-child'
import type { DerivedInfluenceError } from '../../domain/errors/derived-influence'
import type { DuplicateAkaError } from '../../domain/errors/duplicate-aka'
import type { SelfInfluenceError } from '../../domain/errors/self-influence'
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
    private authorization: IAuthorizationApplication,
  ) {}

  async execute(
    data: CreateGenreInput,
    accountId: number,
  ): Promise<
    | { id: number }
    | UnauthorizedError
    | SelfInfluenceError
    | DuplicateAkaError
    | DerivedChildError
    | DerivedInfluenceError
  > {
    const hasPermission = await this.authorization.hasPermission(
      accountId,
      GenresPermission.CreateGenres,
    )
    if (!hasPermission) return new UnauthorizedError()

    const genre = Genre.create(data)

    if (genre instanceof Error) {
      return genre
    }

    const genreTree = await this.genreTreeRepo.get()

    const genreTreeNode = GenreTreeNode.create(
      -1,
      genre.name,
      data.parents,
      data.derivedFrom,
      data.influences,
    )
    if (genreTreeNode instanceof Error) {
      return genreTreeNode
    }

    genreTree.insertGenre(genreTreeNode)

    const { id } = await this.genreRepo.save(genre)

    genreTreeNode.id = id

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
  }
}
