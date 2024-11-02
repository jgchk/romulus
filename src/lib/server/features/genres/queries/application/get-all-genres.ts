import { intersection } from 'ramda'

import type { IDrizzleConnection } from '$lib/server/db/connection'
import {
  type FindAllGenre,
  type FindAllParams,
  type FindAllSortField,
  type FindAllSortOrder,
  GenresDatabase,
} from '$lib/server/db/controllers/genre'
import { GenreHistoryDatabase } from '$lib/server/db/controllers/genre-history'
import { GenreParentsDatabase } from '$lib/server/db/controllers/genre-parents'
import type { GenreType } from '$lib/types/genres'

export type GetManyGenresParams<I extends FindAllInclude> = {
  skip?: number
  limit?: number
  include?: I[]
  filter?: {
    name?: string
    subtitle?: string | null
    type?: GenreType
    relevance?: number | null
    nsfw?: boolean
    shortDescription?: string | null
    longDescription?: string | null
    notes?: string | null
    createdAt?: Date
    updatedAt?: Date
    createdBy?: number
    parents?: number[]
    ancestors?: number[]
  }
  sort?: {
    field?: FindAllSortField
    order?: FindAllSortOrder
  }
}

export type GetAllGenresResult<I extends FindAllInclude = never> = {
  data: FindAllGenre<I>[]
  pagination: { skip: number; limit: number; total: number }
}

export const FIND_ALL_INCLUDE = ['parents', 'influencedBy', 'akas'] as const
export type FindAllInclude = (typeof FIND_ALL_INCLUDE)[number]

export class GetAllGenresQuery {
  constructor(private db: IDrizzleConnection) {}

  async execute<I extends FindAllInclude = never>({
    skip = 0,
    limit = 25,
    include = [],
    filter = {},
    sort = {},
  }: GetManyGenresParams<I>): Promise<GetAllGenresResult> {
    const genresDb = new GenresDatabase()

    const filter_: FindAllParams<I>['filter'] = filter

    if (filter.createdBy !== undefined) {
      const ids = await this.getCreatedByFilterGenreIds(filter.createdBy)
      filter_.ids = ids
    }

    if (filter.parents !== undefined) {
      const ids = await this.getParentsFilterGenreIds(filter.parents)
      if (filter_.ids !== undefined) {
        filter_.ids = intersection(filter_.ids, ids)
      } else {
        filter_.ids = ids
      }
    }

    if (filter.ancestors !== undefined) {
      const ids = await this.getAncestorsFilterGenreIds(filter.ancestors)
      if (filter_.ids !== undefined) {
        filter_.ids = intersection(filter_.ids, ids)
      } else {
        filter_.ids = ids
      }
    }

    const { results, total } = await genresDb.findAll(
      { skip, limit, include, filter: filter_, sort },
      this.db,
    )

    return {
      data: results,
      pagination: { skip, limit, total },
    }
  }

  private async getCreatedByFilterGenreIds(accountId: number): Promise<number[]> {
    const genreHistoryDb = new GenreHistoryDatabase()
    const { results: history } = await genreHistoryDb.findAll(
      { filter: { accountId, operation: 'CREATE' } },
      this.db,
    )
    return history.map((h) => h.treeGenreId)
  }

  private async getParentsFilterGenreIds(parents: number[]): Promise<number[]> {
    const genreParentsDb = new GenreParentsDatabase()
    const allParentChildren = await Promise.all(
      parents.map((parentId) => genreParentsDb.findByParentId(parentId, this.db)),
    )
    const childIds = allParentChildren
      .map((parentChildren) => parentChildren.map((child) => child.childId))
      .reduce((acc, val) => intersection(acc, val))
    return childIds
  }

  private async getAncestorsFilterGenreIds(ancestors: number[]): Promise<number[]> {
    const genreParentsDb = new GenreParentsDatabase()
    const allParentChildren = await genreParentsDb.findAll(this.db)
    const parentsMap = allParentChildren.reduce(
      (acc, val) => {
        acc[val.parentId] = acc[val.parentId] ?? []
        acc[val.parentId].push(val.childId)
        return acc
      },
      {} as Record<number, number[]>,
    )

    const descendantLists = ancestors.map((ancestor) => this.dfs(ancestor, parentsMap))
    const descendantIds = descendantLists.reduce((acc, val) => intersection(acc, val))
    return descendantIds
  }

  private dfs(ancestor: number, parentsMap: Record<number, number[]>): number[] {
    const queue: number[] = [ancestor]
    const descendants: number[] = []
    let currentNode = queue.shift()
    while (currentNode !== undefined) {
      const children = parentsMap[currentNode] ?? []
      descendants.push(...children)
      queue.push(...children)
      currentNode = queue.shift()
    }
    return descendants
  }
}
