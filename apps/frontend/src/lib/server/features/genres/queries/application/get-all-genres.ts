import { intersection } from 'ramda'

import type { IDrizzleConnection } from '$lib/server/db/connection'
import { type Genre } from '$lib/server/db/schema'
import { type GenreType } from '$lib/types/genres'

import {
  DrizzleGetAllGenresQuery,
  type DrizzleGetAllGenresQueryInput,
} from '../infrastructure/drizzle-get-all-genres'

export type GetAllGenresQueryInput<I extends GetAllGenresQueryIncludeFields = never> = {
  skip?: number
  limit?: number
  include?: I[]
  filter?: Filter
  sort?: {
    field?: SortField
    order?: SortOrder
  }
}

export type GetAllGenresQueryIncludeFields = 'parents' | 'influencedBy' | 'akas'

type Filter = {
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

type SortField =
  | 'id'
  | 'name'
  | 'subtitle'
  | 'type'
  | 'relevance'
  | 'nsfw'
  | 'shortDescription'
  | 'longDescription'
  | 'notes'
  | 'createdAt'
  | 'updatedAt'

type SortOrder = 'asc' | 'desc'

type GetAllGenresQueryResult<I extends GetAllGenresQueryIncludeFields = never> = {
  data: GenreWithIncludedFields<I>[]
  pagination: { skip: number; limit: number; total: number }
}

type GenreWithIncludedFields<T extends GetAllGenresQueryIncludeFields> = Genre & {
  [K in T]: K extends 'parents'
    ? number[]
    : K extends 'influencedBy'
      ? number[]
      : K extends 'akas'
        ? { primary: string[]; secondary: string[]; tertiary: string[] }
        : never
}

export class GetAllGenresQuery {
  private drizzleGetAllGenresQuery: DrizzleGetAllGenresQuery

  constructor(private db: IDrizzleConnection) {
    this.drizzleGetAllGenresQuery = new DrizzleGetAllGenresQuery(db)
  }

  async execute<I extends GetAllGenresQueryIncludeFields = never>({
    skip = 0,
    limit = 25,
    include = [],
    filter: inputFilter = {},
    sort = {},
  }: GetAllGenresQueryInput<I> = {}): Promise<GetAllGenresQueryResult<I>> {
    const databaseFilter = await this.constructDatabaseFilter(inputFilter)

    const { results, total } = await this.drizzleGetAllGenresQuery.execute({
      skip,
      limit,
      include,
      filter: databaseFilter,
      sort,
    })

    return {
      data: results,
      pagination: { skip, limit, total },
    }
  }

  private async constructDatabaseFilter(inputFilter: Filter) {
    const databaseFilter: DrizzleGetAllGenresQueryInput['filter'] = inputFilter

    if (inputFilter.createdBy !== undefined) {
      const ids = await this.getCreatedByFilterGenreIds(inputFilter.createdBy)
      databaseFilter.ids = ids
    }

    if (inputFilter.parents !== undefined) {
      const ids = await this.getParentsFilterGenreIds(inputFilter.parents)
      if (databaseFilter.ids !== undefined) {
        databaseFilter.ids = intersection(databaseFilter.ids, ids)
      } else {
        databaseFilter.ids = ids
      }
    }

    if (inputFilter.ancestors !== undefined) {
      const ids = await this.getAncestorsFilterGenreIds(inputFilter.ancestors)
      if (databaseFilter.ids !== undefined) {
        databaseFilter.ids = intersection(databaseFilter.ids, ids)
      } else {
        databaseFilter.ids = ids
      }
    }

    return databaseFilter
  }

  private async getCreatedByFilterGenreIds(accountId: number): Promise<number[]> {
    const history = await this.db.query.genreHistory.findMany({
      where: (genreHistory, { and, eq }) =>
        and(eq(genreHistory.accountId, accountId), eq(genreHistory.operation, 'CREATE')),
      columns: { treeGenreId: true },
    })

    return history.map((h) => h.treeGenreId)
  }

  private async getParentsFilterGenreIds(parents: number[]): Promise<number[]> {
    const allParentChildren = await Promise.all(
      parents.map((parentId) => {
        return this.db.query.genreParents.findMany({
          where: (genreParents, { eq }) => eq(genreParents.parentId, parentId),
        })
      }),
    )
    const childIds = allParentChildren
      .map((parentChildren) => parentChildren.map((child) => child.childId))
      .reduce((acc, val) => intersection(acc, val))
    return childIds
  }

  private async getAncestorsFilterGenreIds(ancestors: number[]): Promise<number[]> {
    const allParentChildren = await this.db.query.genreParents.findMany()
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
