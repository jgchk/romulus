import { z } from 'zod'

import { diceCoefficient, toAscii } from '../utils/string'

export const GENRE_OPERATIONS = ['DELETE', 'UPDATE', 'CREATE'] as const
export type GenreOperation = (typeof GENRE_OPERATIONS)[number]

export const GENRE_TYPES = ['TREND', 'SCENE', 'STYLE', 'META', 'MOVEMENT'] as const
export type GenreType = (typeof GENRE_TYPES)[number]

export const GenreTypeNames: Record<GenreType, string> = {
  MOVEMENT: 'Movement',
  META: 'Meta',
  STYLE: 'Style',
  TREND: 'Trend',
  SCENE: 'Scene',
}

export function getGenreRelevanceText(relevance: number) {
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
    default: {
      throw new Error(`Not a valid relevance: ${relevance}`)
    }
  }
}

export const MIN_GENRE_RELEVANCE = 0
export const MAX_GENRE_RELEVANCE = 7
export const UNSET_GENRE_RELEVANCE = 99

export const MIN_AKA_RELEVANCE = 1
export const MAX_AKA_RELEVANCE = 3

export const genreRelevance = z
  .number()
  .int()
  .min(MIN_GENRE_RELEVANCE)
  .max(MAX_GENRE_RELEVANCE)
  .or(z.literal(UNSET_GENRE_RELEVANCE))

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
}

export type SearchGenre = Pick<SimpleGenre, 'id' | 'name' | 'subtitle' | 'akas'>

export type GenreMatch<T> = {
  id: number
  genre: T
  matchedAka?: string
  weight: number
}

export function searchGenres<T extends SearchGenre>(genres: T[], query: string) {
  const m: GenreMatch<T>[] = []

  for (const genre of genres) {
    let name = genre.name
    if (genre.subtitle) {
      name += ` [${genre.subtitle}]`
    }
    const nameWeight = getMatchWeight(name, query)
    let match: GenreMatch<T> = { id: genre.id, genre, weight: nameWeight }

    for (const aka of genre.akas) {
      // TODO: incorporate aka relevance
      const akaWeight = getMatchWeight(aka, query)
      if (akaWeight > match.weight) {
        match = {
          id: genre.id,
          genre,
          matchedAka: aka,
          weight: akaWeight,
        }
      }
    }

    if (match.weight >= WEIGHT_THRESHOLD) {
      m.push(match)
    }
  }

  return m.sort((a, b) => b.weight - a.weight || a.genre.name.localeCompare(b.genre.name))
}

const WEIGHT_THRESHOLD = 0.2
const toFilterString = (s: string) => toAscii(s.toLowerCase())
function getMatchWeight(name: string, filter: string) {
  const fName = toFilterString(name)
  const fFilter = toFilterString(filter)

  if (fName.length < 2 || fFilter.length < 2) {
    if (fName.startsWith(fFilter)) {
      return 1
    } else if (fName.includes(fFilter)) {
      return 0.5
    } else {
      return 0
    }
  }

  return diceCoefficient(fName, fFilter)
}
