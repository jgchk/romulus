import { equals } from 'ramda'

import type { GenreHistory } from './genre-history'

export type GenreUpdate = {
  name?: string
  subtitle?: string | null
  type?: 'TREND' | 'SCENE' | 'STYLE' | 'META' | 'MOVEMENT'
  nsfw?: boolean
  shortDescription?: string | null
  longDescription?: string | null
  notes?: string | null
  parents?: Set<number>
  influences?: Set<number>
  akas?: {
    primary?: string[]
    secondary?: string[]
    tertiary?: string[]
  }
}

export class Genre {
  readonly id: number
  readonly name: string
  readonly subtitle: string | undefined
  readonly type: 'TREND' | 'SCENE' | 'STYLE' | 'META' | 'MOVEMENT'
  readonly nsfw: boolean
  readonly shortDescription: string | undefined
  readonly longDescription: string | undefined
  readonly notes: string | undefined
  readonly parents: Set<number>
  readonly influences: Set<number>
  readonly akas: {
    readonly primary: string[]
    readonly secondary: string[]
    readonly tertiary: string[]
  }
  readonly relevance: number
  readonly createdAt: Date
  readonly updatedAt: Date

  constructor(
    id: number,
    name: string,
    subtitle: string | undefined,
    type: 'TREND' | 'SCENE' | 'STYLE' | 'META' | 'MOVEMENT',
    nsfw: boolean,
    shortDescription: string | undefined,
    longDescription: string | undefined,
    notes: string | undefined,
    parents: Set<number>,
    influences: Set<number>,
    akas: {
      primary: string[]
      secondary: string[]
      tertiary: string[]
    },
    relevance: number,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id
    this.name = name
    this.subtitle = subtitle
    this.type = type
    this.nsfw = nsfw
    this.shortDescription = shortDescription
    this.longDescription = longDescription
    this.notes = notes
    this.parents = new Set(parents)
    this.influences = new Set(influences)
    this.akas = {
      primary: [...akas.primary],
      secondary: [...akas.secondary],
      tertiary: [...akas.tertiary],
    }
    this.relevance = relevance
    this.createdAt = new Date(createdAt)
    this.updatedAt = new Date(updatedAt)
  }

  withUpdate(data: GenreUpdate): Genre {
    return new Genre(
      this.id,
      data.name ?? this.name,
      data.subtitle === undefined ? this.subtitle : (data.subtitle ?? undefined),
      data.type ?? this.type,
      data.nsfw ?? this.nsfw,
      data.shortDescription === undefined
        ? this.shortDescription
        : (data.shortDescription ?? undefined),
      data.longDescription === undefined
        ? this.longDescription
        : (data.longDescription ?? undefined),
      data.notes === undefined ? this.notes : (data.notes ?? undefined),
      data.parents ?? this.parents,
      data.influences ?? this.influences,
      {
        primary: data.akas?.primary ?? this.akas.primary,
        secondary: data.akas?.secondary ?? this.akas.secondary,
        tertiary: data.akas?.tertiary ?? this.akas.tertiary,
      },
      this.relevance,
      this.createdAt,
      new Date(),
    )
  }

  doesInfluenceSelf(): boolean {
    return this.influences.has(this.id)
  }

  isChangedFrom(genreHistory: GenreHistory): boolean {
    return (
      this.name !== genreHistory.name ||
      this.subtitle !== genreHistory.subtitle ||
      this.type !== genreHistory.type ||
      this.nsfw !== genreHistory.nsfw ||
      this.shortDescription !== genreHistory.shortDescription ||
      this.longDescription !== genreHistory.longDescription ||
      this.notes !== genreHistory.notes ||
      !equals(this.parents, genreHistory.parents) ||
      !equals(this.influences, genreHistory.influences) ||
      !equals(this.akas, genreHistory.akas)
    )
  }
}
