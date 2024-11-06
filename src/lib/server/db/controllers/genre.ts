import { asc, eq } from 'drizzle-orm'

import type { IDrizzleConnection } from '../connection'
import { type Genre, genreAkas, genres } from '../schema'

export class GenresDatabase {
  async findByIdEdit(
    id: Genre['id'],
    conn: IDrizzleConnection,
  ): Promise<
    | (Genre & {
        akas: {
          primary: string[]
          secondary: string[]
          tertiary: string[]
        }
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
          },
          orderBy: asc(genreAkas.order),
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
      akas: {
        primary: result.akas.filter((aka) => aka.relevance === 3).map((aka) => aka.name),
        secondary: result.akas.filter((aka) => aka.relevance === 2).map((aka) => aka.name),
        tertiary: result.akas.filter((aka) => aka.relevance === 1).map((aka) => aka.name),
      },
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
