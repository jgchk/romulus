import { diceCoefficient, toAscii } from '$lib/utils/string'

import type { TreeGenre } from '../types'

export type SearchGenresQuery = (query: string) => GenreMatch[]

export type GenreMatch = {
  id: number
  genre: TreeGenre
  matchedAka?: string
  weight: number
}

export function createSearchGenresQuery(genres: TreeGenre[]): SearchGenresQuery {
  return function searchGenres(query: string) {
    const m: GenreMatch[] = []

    for (const genre of genres) {
      let name = genre.name
      if (genre.subtitle) {
        name += ` [${genre.subtitle}]`
      }
      const nameWeight = getMatchWeight(name, query)
      let match: GenreMatch = { id: genre.id, genre, weight: nameWeight }

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
