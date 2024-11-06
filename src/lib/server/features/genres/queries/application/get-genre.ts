import { asc, eq } from 'drizzle-orm'

import type { IDrizzleConnection } from '$lib/server/db/connection'
import { type Genre, genreAkas, genreHistory, genres } from '$lib/server/db/schema'

export type GetGenreResult = {
  id: number
  name: string
  subtitle: string | null
  type: 'TREND' | 'SCENE' | 'STYLE' | 'META' | 'MOVEMENT'
  relevance: number
  nsfw: boolean
  shortDescription: string | null
  longDescription: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
  akas: {
    primary: string[]
    secondary: string[]
    tertiary: string[]
  }
  parents: {
    id: number
    name: string
    type: 'TREND' | 'SCENE' | 'STYLE' | 'META' | 'MOVEMENT'
    subtitle: string | null
    nsfw: boolean
  }[]
  children: {
    id: number
    name: string
    type: 'TREND' | 'SCENE' | 'STYLE' | 'META' | 'MOVEMENT'
  }[]
  influencedBy: {
    id: number
    name: string
    type: 'TREND' | 'SCENE' | 'STYLE' | 'META' | 'MOVEMENT'
    subtitle: string | null
    nsfw: boolean
  }[]
  influences: {
    id: number
    name: string
    type: 'TREND' | 'SCENE' | 'STYLE' | 'META' | 'MOVEMENT'
    subtitle: string | null
    nsfw: boolean
  }[]
  history: {
    account: {
      id: number
      username: string
    } | null
  }[]
}

export class GetGenreQuery {
  constructor(private db: IDrizzleConnection) {}

  async execute(id: Genre['id']): Promise<GetGenreResult | undefined> {
    const result = await this.db.query.genres.findFirst({
      where: eq(genres.id, id),
      with: {
        akas: {
          columns: { name: true, relevance: true },
          orderBy: asc(genreAkas.order),
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

    if (!result) return undefined

    return {
      ...result,
      akas: {
        primary: result.akas.filter((aka) => aka.relevance === 3).map((aka) => aka.name),
        secondary: result.akas.filter((aka) => aka.relevance === 2).map((aka) => aka.name),
        tertiary: result.akas.filter((aka) => aka.relevance === 1).map((aka) => aka.name),
      },
      parents: result.parents.map((parent) => parent.parent),
      children: result.children.map((child) => child.child),
      influencedBy: result.influencedBy.map((influence) => influence.influencer),
      influences: result.influences.map((influence) => influence.influenced),
    }
  }
}
