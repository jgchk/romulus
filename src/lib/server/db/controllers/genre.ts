import { and, asc, count, desc, eq, inArray, isNull, or } from 'drizzle-orm'

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
  filter?: {
    ids?: number[]
    shortDescription?: string
  }
}

export type FindAllInclude = 'parents' | 'influencedBy' | 'akas'

export type FindAllGenre<T extends FindAllInclude> = Genre & {
  [K in T]: K extends 'parents'
    ? number[]
    : K extends 'influencedBy'
      ? number[]
      : K extends 'akas'
        ? { primary: string[]; secondary: string[]; tertiary: string[] }
        : never
}

export interface IGenresDatabase<T> {
  insert(
    data: ExtendedInsertGenre[],
    conn: T,
  ): Promise<
    (Genre & {
      akas: Omit<GenreAka, 'genreId'>[]
      parents: number[]
      influencedBy: number[]
    })[]
  >

  update(
    id: Genre['id'],
    update: Partial<ExtendedInsertGenre>,
    conn: T,
  ): Promise<
    Genre & {
      akas: Omit<GenreAka, 'genreId'>[]
      parents: number[]
      influencedBy: number[]
    }
  >

  findAllIds(conn: T): Promise<number[]>

  findAll<I extends FindAllInclude>(
    params: FindAllParams<I>,
    conn: T,
  ): Promise<{ results: FindAllGenre<I>[]; total: number }>

  findByIdSimple(id: Genre['id'], conn: T): Promise<Genre | undefined>

  findByIdDetail(
    id: Genre['id'],
    conn: T,
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
  >

  findByIdHistory(
    id: Genre['id'],
    conn: T,
  ): Promise<
    | (Genre & {
        akas: Pick<GenreAka, 'name' | 'relevance' | 'order'>[]
        parents: number[]
        children: number[]
        influencedBy: number[]
        influences: number[]
      })
    | undefined
  >

  findByIdEdit(
    id: Genre['id'],
    conn: T,
  ): Promise<
    | (Genre & {
        akas: Pick<GenreAka, 'name' | 'relevance' | 'order'>[]
        parents: number[]
        influencedBy: number[]
      })
    | undefined
  >

  findByIds(
    ids: Genre['id'][],
    conn: T,
  ): Promise<
    (Genre & {
      akas: Pick<GenreAka, 'name' | 'relevance' | 'order'>[]
      parents: number[]
      influencedBy: number[]
    })[]
  >

  findByName(name: string, conn: T): Promise<Genre[]>

  findAllSimple(conn: T): Promise<(Pick<Genre, 'id' | 'name'> & { parents: number[] })[]>

  findAllTree(conn: T): Promise<
    (Pick<Genre, 'id' | 'name' | 'subtitle' | 'type' | 'relevance' | 'nsfw' | 'updatedAt'> & {
      akas: GenreAka['name'][]
      parents: GenreParent['parentId'][]
      children: GenreParent['childId'][]
    })[]
  >

  deleteById(id: Genre['id'], conn: T): Promise<void>
  deleteByIds(ids: Genre['id'][], conn: T): Promise<void>
  deleteAll(conn: T): Promise<void>
}

export class GenresDatabase implements IGenresDatabase<IDrizzleConnection> {
  insert(data: ExtendedInsertGenre[], conn: IDrizzleConnection) {
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

  async update(id: Genre['id'], update: Partial<ExtendedInsertGenre>, conn: IDrizzleConnection) {
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

  async findAllIds(conn: IDrizzleConnection) {
    const results = await conn.query.genres.findMany({
      columns: {
        id: true,
      },
    })

    return results.map(({ id }) => id)
  }

  async findAll<I extends FindAllInclude>(
    { skip, limit, include = [], filter = {} }: FindAllParams<I>,
    conn: IDrizzleConnection,
  ): Promise<{ results: FindAllGenre<I>[]; total: number }> {
    const includeParents = (include as string[]).includes('parents')
    const includeInfluencedBy = (include as string[]).includes('influencedBy')
    const includeAkas = (include as string[]).includes('akas')

    const wheres = []
    if (filter.ids !== undefined && filter.ids.length > 0) {
      wheres.push(inArray(genres.id, filter.ids))
    }
    if (filter.shortDescription !== undefined) {
      if (filter.shortDescription === '') {
        wheres.push(
          or(eq(genres.shortDescription, filter.shortDescription), isNull(genres.shortDescription)),
        )
      } else {
        wheres.push(eq(genres.shortDescription, filter.shortDescription))
      }
    }
    const where = wheres.length > 0 ? and(...wheres) : undefined

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

  findByIdSimple(id: Genre['id'], conn: IDrizzleConnection) {
    return conn.query.genres.findFirst({
      where: eq(genres.id, id),
    })
  }

  findByIdDetail(id: Genre['id'], conn: IDrizzleConnection) {
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

  async findByIdHistory(id: Genre['id'], conn: IDrizzleConnection) {
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

  async findByIdEdit(id: Genre['id'], conn: IDrizzleConnection) {
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

  async findByName(name: string, conn: IDrizzleConnection) {
    return conn.query.genres.findMany({
      where: eq(genres.name, name),
    })
  }

  async findByIds(ids: Genre['id'][], conn: IDrizzleConnection) {
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

  async findAllSimple(conn: IDrizzleConnection) {
    const results = await conn.query.genres.findMany({
      columns: {
        id: true,
        name: true,
      },
      with: {
        parents: {
          columns: { parentId: true },
        },
      },
    })

    return results.map(({ parents, ...genre }) => ({
      ...genre,
      parents: parents.map((parent) => parent.parentId),
    }))
  }

  async findAllTree(conn: IDrizzleConnection) {
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
      orderBy: (genres_1, { asc }) => asc(genres_1.name),
      with: {
        akas: {
          columns: { name: true },
          orderBy: [desc(genreAkas.relevance), asc(genreAkas.order)],
        },
        parents: {
          columns: { parentId: true },
          with: {
            parent: {
              columns: { name: true },
            },
          },
        },
        children: {
          columns: { childId: true },
          with: {
            child: {
              columns: { name: true },
            },
          },
        },
      },
    })

    return results.map(({ akas, parents, children, ...genre }) => ({
      ...genre,
      akas: akas.map((aka) => aka.name),
      parents: parents
        .sort((a, b) => a.parent.name.localeCompare(b.parent.name))
        .map((parent) => parent.parentId),
      children: children
        .sort((a_1, b_1) => a_1.child.name.localeCompare(b_1.child.name))
        .map((child) => child.childId),
    }))
  }

  async deleteById(id: Genre['id'], conn: IDrizzleConnection) {
    await conn.delete(genres).where(eq(genres.id, id))
  }

  async deleteByIds(ids: Genre['id'][], conn: IDrizzleConnection) {
    if (ids.length === 0) return
    await conn.delete(genres).where(inArray(genres.id, ids))
  }

  async deleteAll(conn: IDrizzleConnection) {
    await conn.delete(genres)
  }
}
