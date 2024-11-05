import { asc, desc, eq, inArray } from 'drizzle-orm'

import { type GenreType } from '$lib/types/genres'

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

  async findAllIds(conn: IDrizzleConnection): Promise<number[]> {
    const results = await conn.query.genres.findMany({
      columns: {
        id: true,
      },
    })

    return results.map(({ id }) => id)
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
}
