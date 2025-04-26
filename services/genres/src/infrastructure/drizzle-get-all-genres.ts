import type { SQL } from 'drizzle-orm'
import { and, asc, count, desc, eq, inArray, isNull, or } from 'drizzle-orm'

import type { IDrizzleConnection } from './drizzle-database.js'
import type { Genre, GenreType } from './drizzle-schema.js'
import { genreAkas, genres, UNSET_GENRE_RELEVANCE } from './drizzle-schema.js'

export type DrizzleGetAllGenresQueryInput<I extends IncludeFields = never> = {
  skip?: number
  limit?: number
  include?: I[]
  filter?: DrizzleGetAllGenresQueryFilter
  sort?: {
    field?: SortField
    order?: SortOrder
  }
}

type IncludeFields = 'parents' | 'influencedBy' | 'akas'

type DrizzleGetAllGenresQueryFilter = {
  ids?: number[]
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

type DrizzleGetAllGenresQueryOutput<I extends IncludeFields> = {
  results: GenreWithIncludedFields<I>[]
  total: number
}

type GenreWithIncludedFields<T extends IncludeFields> = Genre & {
  [K in T]: K extends 'parents'
    ? number[]
    : K extends 'influencedBy'
      ? number[]
      : K extends 'akas'
        ? { primary: string[]; secondary: string[]; tertiary: string[] }
        : never
}

export class DrizzleGetAllGenresQuery {
  constructor(private db: IDrizzleConnection) {}

  async execute<I extends IncludeFields>({
    skip,
    limit,
    include = [],
    filter = {},
    sort = {},
  }: DrizzleGetAllGenresQueryInput<I>): Promise<DrizzleGetAllGenresQueryOutput<I>> {
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
      total: totalResults.length > 0 ? totalResults[0]!.total : 0,
    }
  }
}
