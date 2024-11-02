import { and, asc, count, desc, eq, inArray, isNull, or, type SQL } from 'drizzle-orm'
import { intersection } from 'ramda'

import type { IDrizzleConnection } from '$lib/server/db/connection'
import {
  type FindAllFilter,
  type FindAllGenre,
  type FindAllParams,
  type FindAllSortField,
  type FindAllSortOrder,
} from '$lib/server/db/controllers/genre'
import { GenreHistoryDatabase } from '$lib/server/db/controllers/genre-history'
import { GenreParentsDatabase } from '$lib/server/db/controllers/genre-parents'
import { genreAkas, genres } from '$lib/server/db/schema'
import { type GenreType, UNSET_GENRE_RELEVANCE } from '$lib/types/genres'

export type GetAllGenresParams<I extends FindAllInclude> = {
  skip?: number
  limit?: number
  include?: I[]
  filter?: GetAllGenresFilter
  sort?: {
    field?: FindAllSortField
    order?: FindAllSortOrder
  }
}

type GetAllGenresFilter = {
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
    filter: inputFilter = {},
    sort = {},
  }: GetAllGenresParams<I>): Promise<GetAllGenresResult> {
    const databaseFilter = await this.constructDatabaseFilter(inputFilter)

    const { results, total } = await this.runDatabaseQuery({
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

  private async constructDatabaseFilter(inputFilter: GetAllGenresFilter) {
    const databaseFilter: FindAllFilter = inputFilter

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

  private async runDatabaseQuery<I extends FindAllInclude>({
    skip,
    limit,
    include = [],
    filter = {},
    sort = {},
  }: FindAllParams<I>): Promise<{ results: FindAllGenre<I>[]; total: number }> {
    const includeParents = (include as string[]).includes('parents')
    const includeInfluencedBy = (include as string[]).includes('influencedBy')
    const includeAkas = (include as string[]).includes('akas')

    const wheres: (SQL | undefined)[] = []
    if (filter.ids !== undefined) {
      wheres.push(inArray(genres.id, filter.ids))
    }
    if (filter.name !== undefined) {
      wheres.push(eq(genres.name, filter.name))
    }
    if (filter.subtitle !== undefined) {
      if (filter.subtitle === '' || filter.subtitle === null) {
        wheres.push(or(eq(genres.subtitle, ''), isNull(genres.subtitle)))
      } else {
        wheres.push(eq(genres.subtitle, filter.subtitle))
      }
    }
    if (filter.type !== undefined) {
      wheres.push(eq(genres.type, filter.type))
    }
    if (filter.relevance !== undefined) {
      if (filter.relevance === UNSET_GENRE_RELEVANCE || filter.relevance === null) {
        wheres.push(eq(genres.relevance, UNSET_GENRE_RELEVANCE))
      } else {
        wheres.push(eq(genres.relevance, filter.relevance))
      }
    }
    if (filter.nsfw !== undefined) {
      wheres.push(eq(genres.nsfw, filter.nsfw))
    }
    if (filter.shortDescription !== undefined) {
      if (filter.shortDescription === '' || filter.shortDescription === null) {
        wheres.push(or(eq(genres.shortDescription, ''), isNull(genres.shortDescription)))
      } else {
        wheres.push(eq(genres.shortDescription, filter.shortDescription))
      }
    }
    if (filter.longDescription !== undefined) {
      if (filter.longDescription === '' || filter.longDescription === null) {
        wheres.push(or(eq(genres.longDescription, ''), isNull(genres.longDescription)))
      } else {
        wheres.push(eq(genres.longDescription, filter.longDescription))
      }
    }
    if (filter.notes !== undefined) {
      if (filter.notes === '' || filter.notes === null) {
        wheres.push(or(eq(genres.notes, ''), isNull(genres.notes)))
      } else {
        wheres.push(eq(genres.notes, filter.notes))
      }
    }
    if (filter.createdAt !== undefined) {
      wheres.push(eq(genres.createdAt, filter.createdAt))
    }
    if (filter.updatedAt !== undefined) {
      wheres.push(eq(genres.updatedAt, filter.updatedAt))
    }
    const where = wheres.length > 0 ? and(...wheres) : undefined

    const sortDirection = sort?.order === 'desc' ? desc : asc

    let sortField
    if (sort.field === 'id') {
      sortField = genres.id
    } else if (sort.field === 'name') {
      sortField = genres.name
    } else if (sort.field === 'subtitle') {
      sortField = genres.subtitle
    } else if (sort.field === 'type') {
      sortField = genres.type
    } else if (sort.field === 'relevance') {
      sortField = genres.relevance
    } else if (sort.field === 'nsfw') {
      sortField = genres.nsfw
    } else if (sort.field === 'shortDescription') {
      sortField = genres.shortDescription
    } else if (sort.field === 'longDescription') {
      sortField = genres.longDescription
    } else if (sort.field === 'notes') {
      sortField = genres.notes
    } else if (sort.field === 'createdAt') {
      sortField = genres.createdAt
    } else if (sort.field === 'updatedAt') {
      sortField = genres.updatedAt
    } else {
      sortField = genres.id
    }

    const dataQuery = this.db.query.genres.findMany({
      where,
      offset: skip,
      limit,
      with: {
        parents: includeParents ? { columns: { parentId: true } } : undefined,
        influencedBy: includeInfluencedBy ? { columns: { influencerId: true } } : undefined,
        akas: includeAkas
          ? {
              columns: { name: true, relevance: true, order: true },
              orderBy: [desc(genres.relevance), asc(genreAkas.order)],
            }
          : undefined,
      },
      orderBy: sortField ? sortDirection(sortField) : undefined,
    })
    const totalQuery = this.db.select({ total: count() }).from(genres).where(where).$dynamic()

    const queryResults = limit === 0 ? [] : await dataQuery.execute()
    const totalResults = await totalQuery.execute()

    const results = queryResults.map((input) => {
      const output = input

      if (includeParents) {
        // @ts-expect-error - we are dynamically adding a new field
        output.parents = input.parents.map(({ parentId }) => parentId)
      }
      if (includeInfluencedBy) {
        // @ts-expect-error - we are dynamically adding a new field
        output.influencedBy = input.influencedBy.map(({ influencerId }) => influencerId)
      }
      if (includeAkas) {
        const akas: { primary: string[]; secondary: string[]; tertiary: string[] } = {
          primary: [],
          secondary: [],
          tertiary: [],
        }

        for (const aka of input.akas) {
          if (aka.relevance === 3) {
            akas.primary.push(aka.name)
          } else if (aka.relevance === 2) {
            akas.secondary.push(aka.name)
          } else {
            akas.tertiary.push(aka.name)
          }
        }

        // @ts-expect-error - we are dynamically adding a new field
        output.akas = akas
      }

      return output
    })

    return {
      // @ts-expect-error - we are dynamically adding new fields
      results,
      total: totalResults.length > 0 ? totalResults[0].total : 0,
    }
  }
}
