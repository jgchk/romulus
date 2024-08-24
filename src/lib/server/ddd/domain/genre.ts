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
  constructor(
    public id: number,
    public name: string,
    public subtitle: string | undefined,
    public type: 'TREND' | 'SCENE' | 'STYLE' | 'META' | 'MOVEMENT',
    public nsfw: boolean,
    public shortDescription: string | undefined,
    public longDescription: string | undefined,
    public notes: string | undefined,

    public parents: Set<number>,
    public influences: Set<number>,
    public akas: {
      primary: string[]
      secondary: string[]
      tertiary: string[]
    },

    public relevance: number,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}

  update(data: GenreUpdate): void {
    this.updatedAt = new Date()

    if (data.name !== undefined) {
      this.name = data.name
    }

    if (data.subtitle !== undefined) {
      if (data.subtitle === null) {
        this.subtitle = undefined
      } else {
        this.subtitle = data.subtitle
      }
    }

    if (data.type !== undefined) {
      this.type = data.type
    }

    if (data.nsfw !== undefined) {
      this.nsfw = data.nsfw
    }

    if (data.shortDescription !== undefined) {
      if (data.shortDescription === null) {
        this.shortDescription = undefined
      } else {
        this.shortDescription = data.shortDescription
      }
    }

    if (data.longDescription !== undefined) {
      if (data.longDescription === null) {
        this.longDescription = undefined
      } else {
        this.longDescription = data.longDescription
      }
    }

    if (data.notes !== undefined) {
      if (data.notes === null) {
        this.notes = undefined
      } else {
        this.notes = data.notes
      }
    }

    if (data.parents !== undefined) {
      this.parents = data.parents
    }

    if (data.influences !== undefined) {
      this.influences = data.influences
    }

    if (data.akas !== undefined) {
      if (data.akas.primary !== undefined) {
        this.akas.primary = data.akas.primary
      }
      if (data.akas.secondary !== undefined) {
        this.akas.secondary = data.akas.secondary
      }
      if (data.akas.tertiary !== undefined) {
        this.akas.tertiary = data.akas.tertiary
      }
    }
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
