import type { SQL } from 'drizzle-orm'
import { and, asc, count, desc, eq, inArray, isNull, or } from 'drizzle-orm'

import { type GenreType, UNSET_GENRE_RELEVANCE } from '$lib/types/genres'
import { hasUpdate, makeUpdate } from '$lib/utils/db'

import type { IDrizzleConnection } from '../connection'
import {
  type Account,
  type Genre,
  type GenreAka,
  genreAkas,
  genreHistory,
  genreInfluences,
  type GenreParent,
  genreParents,
  genres,
  type InsertGenre,
  type InsertGenreAka,
} from '../schema'

export type ExtendedInsertGenre = InsertGenre & {
  akas: Omit<InsertGenreAka, 'genreId'>[]
  parents: number[]
  influencedBy: number[]
}

export type FindAllParams<I extends FindAllInclude> = {
  skip?: number
  limit?: number
  include?: I[]
  filter?: FindAllFilter
  sort?: {
    field?: FindAllSortField
    order?: FindAllSortOrder
  }
}

export type FindAllFilter = {
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

export const FIND_ALL_INCLUDE = ['parents', 'influencedBy', 'akas'] as const
export type FindAllInclude = (typeof FIND_ALL_INCLUDE)[number]

export const FIND_ALL_SORT_FIELD = [
  'id',
  'name',
  'subtitle',
  'type',
  'relevance',
  'nsfw',
  'shortDescription',
  'longDescription',
  'notes',
  'createdAt',
  'updatedAt',
] as const
export type FindAllSortField = (typeof FIND_ALL_SORT_FIELD)[number]

export const FIND_ALL_SORT_ORDER = ['asc', 'desc'] as const
export type FindAllSortOrder = (typeof FIND_ALL_SORT_ORDER)[number]

export type FindAllGenre<T extends FindAllInclude> = Genre & {
  [K in T]: K extends 'parents'
    ? number[]
    : K extends 'influencedBy'
      ? number[]
      : K extends 'akas'
        ? { primary: string[]; secondary: string[]; tertiary: string[] }
        : never
}

export class GenresDatabase {
  insert(
    data: ExtendedInsertGenre[],
    conn: IDrizzleConnection,
  ): Promise<
    (Genre & {
      akas: Omit<GenreAka, 'genreId'>[]
      parents: number[]
      influencedBy: number[]
    })[]
  > {
    return conn.transaction(async (tx) => {
      const entries = await tx.insert(genres).values(data).returning()

      const akas = data.flatMap((entry, i) =>
        entry.akas.map((aka) => ({ ...aka, genreId: entries[i].id })),
      )
      if (akas.length > 0) {
        await tx.insert(genreAkas).values(akas)
      }

      const parents = data.flatMap((entry, i) =>
        entry.parents.map((parentId) => ({ childId: entries[i].id, parentId })),
      )
      if (parents.length > 0) {
        await tx.insert(genreParents).values(parents)
      }

      const influencedBy = data.flatMap((entry, i) =>
        entry.influencedBy.map((influencerId) => ({ influencedId: entries[i].id, influencerId })),
      )
      if (influencedBy.length > 0) {
        await tx.insert(genreInfluences).values(influencedBy)
      }

      const results = await tx.query.genres.findMany({
        where: inArray(
          genres.id,
          entries.map((entry) => entry.id),
        ),
        with: {
          akas: true,
          parents: {
            columns: { parentId: true },
          },
          influencedBy: {
            columns: { influencerId: true },
          },
        },
      })

      return results.map((genre) => ({
        ...genre,
        influencedBy: genre.influencedBy.map(({ influencerId }) => influencerId),
        parents: genre.parents.map(({ parentId }) => parentId),
      }))
    })
  }

  async update(
    id: Genre['id'],
    update: Partial<ExtendedInsertGenre>,
    conn: IDrizzleConnection,
  ): Promise<
    Genre & {
      akas: Omit<GenreAka, 'genreId'>[]
      parents: number[]
      influencedBy: number[]
    }
  > {
    if (update.akas) {
      await conn.delete(genreAkas).where(eq(genreAkas.genreId, id))
      if (update.akas.length > 0) {
        await conn.insert(genreAkas).values(update.akas.map((aka) => ({ ...aka, genreId: id })))
      }
    }

    if (update.parents) {
      await conn.delete(genreParents).where(eq(genreParents.childId, id))
      if (update.parents.length > 0) {
        await conn
          .insert(genreParents)
          .values(update.parents.map((parentId) => ({ parentId, childId: id })))
      }
    }

    if (update.influencedBy) {
      await conn.delete(genreInfluences).where(eq(genreInfluences.influencedId, id))
      if (update.influencedBy.length > 0) {
        await conn
          .insert(genreInfluences)
          .values(update.influencedBy.map((influencerId) => ({ influencerId, influencedId: id })))
      }
    }

    if (!hasUpdate(update)) {
      const genre = await this.findByIdEdit(id, conn)
      if (!genre) throw new Error(`Genre not found: ${id}`)
      return genre
    }

    await conn.update(genres).set(makeUpdate(update)).where(eq(genres.id, id))

    const genre = await this.findByIdEdit(id, conn)
    if (!genre) throw new Error(`Genre not found: ${id}`)
    return genre
  }

  async findAllIds(conn: IDrizzleConnection): Promise<number[]> {
    const results = await conn.query.genres.findMany({
      columns: {
        id: true,
      },
    })

    return results.map(({ id }) => id)
  }

  async findAll<I extends FindAllInclude>(
    { skip, limit, include = [], filter = {}, sort = {} }: FindAllParams<I>,
    conn: IDrizzleConnection,
  ): Promise<{ results: FindAllGenre<I>[]; total: number }> {
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

    const dataQuery = conn.query.genres.findMany({
      where,
      offset: skip,
      limit,
      with: {
        parents: includeParents ? { columns: { parentId: true } } : undefined,
        influencedBy: includeInfluencedBy ? { columns: { influencerId: true } } : undefined,
        akas: includeAkas
          ? {
              columns: { name: true, relevance: true, order: true },
              orderBy: [desc(genreAkas.relevance), asc(genreAkas.order)],
            }
          : undefined,
      },
      orderBy: sortField ? sortDirection(sortField) : undefined,
    })
    const totalQuery = conn.select({ total: count() }).from(genres).where(where).$dynamic()

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

  findByIdDetail(
    id: Genre['id'],
    conn: IDrizzleConnection,
  ): Promise<
    | (Genre & {
        akas: Pick<GenreAka, 'name'>[]
        parents: { parent: Pick<Genre, 'id' | 'name' | 'type' | 'subtitle' | 'nsfw'> }[]
        children: { child: Pick<Genre, 'id' | 'name' | 'type'> }[]
        influencedBy: { influencer: Pick<Genre, 'id' | 'name' | 'type' | 'subtitle' | 'nsfw'> }[]
        influences: { influenced: Pick<Genre, 'id' | 'name' | 'type' | 'subtitle' | 'nsfw'> }[]
        history: { account: Pick<Account, 'id' | 'username'> | null }[]
      })
    | undefined
  > {
    return conn.query.genres.findFirst({
      where: eq(genres.id, id),
      with: {
        akas: {
          columns: { name: true },
          orderBy: [desc(genreAkas.relevance), asc(genreAkas.order)],
        },
        parents: {
          columns: {},
          with: {
            parent: {
              columns: { id: true, name: true, type: true, subtitle: true, nsfw: true },
            },
          },
        },
        children: {
          columns: {},
          with: {
            child: {
              columns: { id: true, name: true, type: true },
            },
          },
        },
        influencedBy: {
          columns: {},
          with: {
            influencer: {
              columns: { id: true, name: true, type: true, subtitle: true, nsfw: true },
            },
          },
        },
        influences: {
          columns: {},
          with: {
            influenced: {
              columns: { id: true, name: true, type: true, subtitle: true, nsfw: true },
            },
          },
        },
        history: {
          columns: {},
          orderBy: [asc(genreHistory.createdAt)],
          with: {
            account: {
              columns: { id: true, username: true },
            },
          },
        },
      },
    })
  }

  async findByIdHistory(
    id: Genre['id'],
    conn: IDrizzleConnection,
  ): Promise<
    | (Genre & {
        akas: Pick<GenreAka, 'name' | 'relevance' | 'order'>[]
        parents: number[]
        children: number[]
        influencedBy: number[]
        influences: number[]
      })
    | undefined
  > {
    const result = await conn.query.genres.findFirst({
      where: eq(genres.id, id),
      with: {
        akas: {
          columns: {
            name: true,
            relevance: true,
            order: true,
          },
        },
        parents: {
          columns: { parentId: true },
        },
        children: {
          columns: { childId: true },
        },
        influencedBy: {
          columns: {
            influencerId: true,
          },
        },
        influences: {
          columns: {
            influencedId: true,
          },
        },
      },
    })

    if (!result) return undefined

    return {
      ...result,

      parents: result.parents.map(({ parentId }) => parentId),
      children: result.children.map(({ childId }) => childId),
      influencedBy: result.influencedBy.map(({ influencerId }) => influencerId),
      influences: result.influences.map(({ influencedId }) => influencedId),
    }
  }

  async findByIdEdit(
    id: Genre['id'],
    conn: IDrizzleConnection,
  ): Promise<
    | (Genre & {
        akas: Pick<GenreAka, 'name' | 'relevance' | 'order'>[]
        parents: number[]
        influencedBy: number[]
      })
    | undefined
  > {
    const result = await conn.query.genres.findFirst({
      where: eq(genres.id, id),
      with: {
        akas: {
          columns: {
            name: true,
            relevance: true,
            order: true,
          },
          orderBy: [desc(genreAkas.relevance), asc(genreAkas.order)],
        },
        parents: {
          columns: {
            parentId: true,
          },
        },
        influencedBy: {
          columns: {
            influencerId: true,
          },
        },
      },
    })

    if (!result) return undefined

    return {
      ...result,
      parents: result.parents.map(({ parentId }) => parentId),
      influencedBy: result.influencedBy.map(({ influencerId }) => influencerId),
    }
  }

  async findByName(name: string, conn: IDrizzleConnection): Promise<Genre[]> {
    return conn.query.genres.findMany({
      where: eq(genres.name, name),
    })
  }

  async findByIds(
    ids: Genre['id'][],
    conn: IDrizzleConnection,
  ): Promise<
    (Genre & {
      akas: Pick<GenreAka, 'name' | 'relevance' | 'order'>[]
      parents: number[]
      influencedBy: number[]
    })[]
  > {
    if (ids.length === 0) return []

    const results = await conn.query.genres.findMany({
      where: inArray(genres.id, ids),
      with: {
        akas: {
          columns: {
            name: true,
            relevance: true,
            order: true,
          },
        },
        parents: {
          columns: {
            parentId: true,
          },
        },
        influencedBy: {
          columns: {
            influencerId: true,
          },
        },
      },
    })

    return results.map((genre) => ({
      ...genre,
      parents: genre.parents.map(({ parentId }) => parentId),
      influencedBy: genre.influencedBy.map(({ influencerId }) => influencerId),
    }))
  }

  async findAllTree(conn: IDrizzleConnection): Promise<
    (Pick<Genre, 'id' | 'name' | 'subtitle' | 'type' | 'relevance' | 'nsfw' | 'updatedAt'> & {
      akas: GenreAka['name'][]
      parents: GenreParent['parentId'][]
      children: GenreParent['childId'][]
    })[]
  > {
    const results = await conn.query.genres.findMany({
      columns: {
        id: true,
        name: true,
        subtitle: true,
        type: true,
        relevance: true,
        nsfw: true,
        updatedAt: true,
      },
      orderBy: (genres, { asc }) => asc(genres.name),
      with: {
        akas: {
          columns: { name: true },
          orderBy: [desc(genreAkas.relevance), asc(genreAkas.order)],
        },
      },
    })

    const parentChildren = await conn.query.genreParents.findMany({
      columns: {
        parentId: true,
        childId: true,
      },
    })

    const genresMap = new Map(
      results.map((genre) => [
        genre.id,
        {
          ...genre,
          parents: [] as { id: number; name: string }[],
          children: [] as { id: number; name: string }[],
        },
      ]),
    )

    for (const { parentId, childId } of parentChildren) {
      const parent = genresMap.get(parentId)
      const child = genresMap.get(childId)
      if (parent && child) {
        parent.children.push({ id: childId, name: child.name })
        child.parents.push({ id: parentId, name: parent.name })
      }
    }

    return [...genresMap.values()].map(({ akas, parents, children, ...genre }) => ({
      ...genre,
      akas: akas.map((aka) => aka.name),
      parents: parents.sort((a, b) => a.name.localeCompare(b.name)).map((parent) => parent.id),
      children: children.sort((a, b) => a.name.localeCompare(b.name)).map((child) => child.id),
    }))
  }

  async deleteById(id: Genre['id'], conn: IDrizzleConnection): Promise<void> {
    await conn.delete(genres).where(eq(genres.id, id))
  }

  async deleteByIds(ids: Genre['id'][], conn: IDrizzleConnection): Promise<void> {
    if (ids.length === 0) return
    await conn.delete(genres).where(inArray(genres.id, ids))
  }
}
