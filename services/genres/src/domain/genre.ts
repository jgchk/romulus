import type { Result } from 'neverthrow'
import { err, ok } from 'neverthrow'
import { equals } from 'ramda'

import { DuplicateAkaError } from './errors/duplicate-aka.js'
import type { GenreHistory } from './genre-history.js'

export type GenreUpdate = {
  name?: string
  subtitle?: string | null
  type?: 'TREND' | 'SCENE' | 'STYLE' | 'META' | 'MOVEMENT'
  nsfw?: boolean
  shortDescription?: string | null
  longDescription?: string | null
  notes?: string | null
  parents?: Set<number>
  derivedFrom?: Set<number>
  influences?: Set<number>
  akas?: {
    primary?: string[]
    secondary?: string[]
    tertiary?: string[]
  }
}

type GenreConstructorParams = {
  id?: number
  name: string
  subtitle?: string
  type: 'TREND' | 'SCENE' | 'STYLE' | 'META' | 'MOVEMENT'
  nsfw: boolean
  shortDescription?: string
  longDescription?: string
  notes?: string
  akas: {
    primary: string[]
    secondary: string[]
    tertiary: string[]
  }
  createdAt: Date
  updatedAt: Date
}

export class Genre {
  readonly id: number | undefined
  readonly name: string
  readonly subtitle: string | undefined
  readonly type: 'TREND' | 'SCENE' | 'STYLE' | 'META' | 'MOVEMENT'
  readonly nsfw: boolean
  readonly shortDescription: string | undefined
  readonly longDescription: string | undefined
  readonly notes: string | undefined
  readonly akas: {
    readonly primary: string[]
    readonly secondary: string[]
    readonly tertiary: string[]
  }
  readonly createdAt: Date
  readonly updatedAt: Date

  private constructor(params: GenreConstructorParams) {
    this.id = params.id
    this.name = params.name.trim()
    this.subtitle = params.subtitle?.trim()
    this.type = params.type
    this.nsfw = params.nsfw
    this.shortDescription = params.shortDescription
    this.longDescription = params.longDescription
    this.notes = params.notes
    this.akas = {
      primary: [...params.akas.primary.map((item) => item.trim()).filter((item) => item !== '')],
      secondary: [
        ...params.akas.secondary.map((item) => item.trim()).filter((item) => item !== ''),
      ],
      tertiary: [...params.akas.tertiary.map((item) => item.trim()).filter((item) => item !== '')],
    }
    this.createdAt = new Date(params.createdAt)
    this.updatedAt = new Date(params.updatedAt)
  }

  static create(params: GenreConstructorParams): Result<Genre, DuplicateAkaError> {
    const genre = new Genre(params)

    const duplicateAkasResult = genre.checkDuplicateAkas()
    if (duplicateAkasResult.isErr()) {
      return err(duplicateAkasResult.error)
    }

    return ok(genre)
  }

  private checkDuplicateAkas(): Result<void, DuplicateAkaError> {
    const set = new Set<string>()

    for (const level of Object.keys(this.akas) as (keyof typeof this.akas)[]) {
      for (const aka of this.akas[level]) {
        if (!set.has(aka)) {
          set.add(aka)
        } else {
          return err(new DuplicateAkaError(aka, level))
        }
      }
    }

    return ok(undefined)
  }

  withUpdate(data: GenreUpdate) {
    return Genre.create({
      id: this.id,
      name: data.name ?? this.name,
      subtitle: data.subtitle === undefined ? this.subtitle : (data.subtitle ?? undefined),
      type: data.type ?? this.type,
      nsfw: data.nsfw ?? this.nsfw,
      shortDescription:
        data.shortDescription === undefined
          ? this.shortDescription
          : (data.shortDescription ?? undefined),
      longDescription:
        data.longDescription === undefined
          ? this.longDescription
          : (data.longDescription ?? undefined),
      notes: data.notes === undefined ? this.notes : (data.notes ?? undefined),
      akas: {
        primary: data.akas?.primary ?? this.akas.primary,
        secondary: data.akas?.secondary ?? this.akas.secondary,
        tertiary: data.akas?.tertiary ?? this.akas.tertiary,
      },
      createdAt: this.createdAt,
      updatedAt: new Date(),
    })
  }

  isChangedFrom(
    parents: Set<number>,
    derivedFrom: Set<number>,
    influences: Set<number>,
    genreHistory: GenreHistory,
  ): boolean {
    return (
      this.name !== genreHistory.name ||
      this.subtitle !== genreHistory.subtitle ||
      this.type !== genreHistory.type ||
      this.nsfw !== genreHistory.nsfw ||
      this.shortDescription !== genreHistory.shortDescription ||
      this.longDescription !== genreHistory.longDescription ||
      this.notes !== genreHistory.notes ||
      !equals(parents, genreHistory.parents) ||
      !equals(derivedFrom, genreHistory.derivedFrom) ||
      !equals(influences, genreHistory.influences) ||
      !equals(this.akas, genreHistory.akas)
    )
  }
}
