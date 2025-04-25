import { asc, eq } from 'drizzle-orm'
import { err, ok, ResultAsync } from 'neverthrow'
import { uniq } from 'ramda'

import { type IDrizzleConnection } from '../../infrastructure/drizzle-database.js'
import { type Genre } from '../../infrastructure/drizzle-schema.js'
import { genreAkas, genreHistory, genres } from '../../infrastructure/drizzle-schema.js'
import { GenreNotFoundError } from '../errors/genre-not-found.js'

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
  derivedFrom: {
    id: number
    name: string
    type: 'TREND' | 'SCENE' | 'STYLE' | 'META' | 'MOVEMENT'
    subtitle: string | null
    nsfw: boolean
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
  contributors: number[]
}

export class GetGenreQuery {
  constructor(private db: IDrizzleConnection) {}

  execute(id: Genre['id']): ResultAsync<GetGenreResult, GenreNotFoundError> {
    return this.query(id)
      .andThen((genre) => {
        if (genre === undefined) return err(new GenreNotFoundError())
        return ok(genre)
      })
      .map((genre) => ({
        id: genre.id,
        name: genre.name,
        subtitle: genre.subtitle,
        type: genre.type,
        relevance: genre.relevance,
        nsfw: genre.nsfw,
        shortDescription: genre.shortDescription,
        longDescription: genre.longDescription,
        notes: genre.notes,
        createdAt: genre.createdAt,
        updatedAt: genre.updatedAt,
        akas: {
          primary: genre.akas.filter((aka) => aka.relevance === 3).map((aka) => aka.name),
          secondary: genre.akas.filter((aka) => aka.relevance === 2).map((aka) => aka.name),
          tertiary: genre.akas.filter((aka) => aka.relevance === 1).map((aka) => aka.name),
        },
        parents: genre.parents.map((parent) => parent.parent),
        derivedFrom: genre.derivedFrom.map((derivedFrom) => derivedFrom.derivedFrom),
        influencedBy: genre.influencedBy.map((influence) => influence.influencer),
        influences: genre.influences.map((influence) => influence.influenced),
        contributors: uniq(
          genre.history.map((history) => history.accountId).filter((id) => id !== null),
        ),
      }))
  }

  private query(id: Genre['id']) {
    return ResultAsync.fromSafePromise(
      this.db.query.genres.findFirst({
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
          derivedFrom: {
            columns: {},
            with: {
              derivedFrom: {
                columns: { id: true, name: true, type: true, subtitle: true, nsfw: true },
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
            columns: { accountId: true },
            orderBy: [asc(genreHistory.createdAt)],
          },
        },
      }),
    )
  }
}
