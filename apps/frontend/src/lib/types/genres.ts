import { z } from 'zod'

export const GENRE_OPERATIONS = ['DELETE', 'UPDATE', 'CREATE'] as const
export type GenreOperation = (typeof GENRE_OPERATIONS)[number]

export const GENRE_TYPES = ['TREND', 'SCENE', 'STYLE', 'META', 'MOVEMENT'] as const
export type GenreType = (typeof GENRE_TYPES)[number]
export const DEFAULT_GENRE_TYPE: GenreType = 'STYLE'

export const GenreTypeNames: Record<GenreType, string> = {
  MOVEMENT: 'Movement',
  META: 'Meta',
  STYLE: 'Style',
  TREND: 'Trend',
  SCENE: 'Scene',
}

export function getGenreRelevanceText(relevance: number | undefined) {
  switch (relevance) {
    case 0: {
      return 'Invented'
    }
    case 1: {
      return 'Unknown'
    }
    case 2: {
      return 'Unestablished'
    }
    case 3: {
      return 'Minor'
    }
    case 4: {
      return 'Significant'
    }
    case 5: {
      return 'Major'
    }
    case 6: {
      return 'Essential'
    }
    case 7: {
      return 'Universal'
    }
    case 99:
    case undefined: {
      return 'Unset'
    }
    default: {
      throw new Error(`Not a valid relevance: ${relevance}`)
    }
  }
}

export const MIN_GENRE_RELEVANCE = 0
export const MAX_GENRE_RELEVANCE = 7
export const UNSET_GENRE_RELEVANCE = 99

export const genreRelevance = z.coerce
  .number()
  .int()
  .refine(
    (v) => v === UNSET_GENRE_RELEVANCE || (v >= MIN_GENRE_RELEVANCE && v <= MAX_GENRE_RELEVANCE),
    { message: `Relevance must be between 0 and 7 (inclusive), or ${UNSET_GENRE_RELEVANCE}` },
  )

export const makeGenreTag = (id: number) => `[Genre${id}]`

export type SimpleGenre = {
  id: number
  name: string
  akas: string[]
  subtitle: string | null
  type: GenreType
  relevance: number
  parents: number[]
  children: number[]
  nsfw: boolean
}
