import { diceCoefficient, toAscii } from '$lib/utils/string'

import type { TreeGenre } from '../types'
import type { GetAllGenresQuery } from './get-all-genres'

export type SearchGenresQuery = (query: string) => Promise<TreeGenre[]>

export function createSearchGenresQuery(getAllGenres: GetAllGenresQuery): SearchGenresQuery {
  return async function searchGenres(query: string) {
    const genres = await getAllGenres()

    const matches = search(query, genres)

    return matches.map((match) => match.genre)
  }
}

type SearchGenre = { id: number; name: string; subtitle: string | null; akas: string[] }

type GenreMatch<Genre extends SearchGenre> = {
  id: number
  genre: Genre
  matchedAka?: string
  weight: number
}

function search<Genre extends SearchGenre>(query: string, genres: Genre[]) {
  const m: GenreMatch<Genre>[] = []

  for (const genre of genres) {
    let name = genre.name
    if (genre.subtitle) {
      name += ` [${genre.subtitle}]`
    }
    const nameWeight = getMatchWeight(name, query)
    let match: GenreMatch<Genre> = { id: genre.id, genre, weight: nameWeight }

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
