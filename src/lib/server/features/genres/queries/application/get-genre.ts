import { asc, desc, eq } from 'drizzle-orm'

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
  akas: { name: string }[]
  parents: {
    parent: {
      id: number
      name: string
      type: 'TREND' | 'SCENE' | 'STYLE' | 'META' | 'MOVEMENT'
      subtitle: string | null
      nsfw: boolean
    }
  }[]
  children: {
    child: {
      id: number
      name: string
      type: 'TREND' | 'SCENE' | 'STYLE' | 'META' | 'MOVEMENT'
    }
  }[]
  influencedBy: {
    influencer: {
      id: number
      name: string
      type: 'TREND' | 'SCENE' | 'STYLE' | 'META' | 'MOVEMENT'
      subtitle: string | null
      nsfw: boolean
    }
  }[]
  influences: {
    influenced: {
      id: number
      name: string
      type: 'TREND' | 'SCENE' | 'STYLE' | 'META' | 'MOVEMENT'
      subtitle: string | null
      nsfw: boolean
    }
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

  execute(id: Genre['id']): Promise<GetGenreResult | undefined> {
    return this.db.query.genres.findFirst({
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
}
