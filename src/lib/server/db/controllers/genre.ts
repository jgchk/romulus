import { asc, desc, eq } from 'drizzle-orm'

import type { IDrizzleConnection } from '../connection'
import { type Account, type Genre, type GenreAka, genreAkas, genreHistory, genres } from '../schema'

export class GenresDatabase {
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
}
