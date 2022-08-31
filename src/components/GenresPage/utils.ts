import { uniqBy } from 'ramda'

import { TreeGenre } from '../../server/db/genre/outputs'
import { isNotNull } from '../../utils/types'

export const getGenreRelevanceText = (relevance: number) => {
  switch (relevance) {
    case 1:
      return 'Unknown'
    case 2:
      return 'Unestablished'
    case 3:
      return 'Minor'
    case 4:
      return 'Significant'
    case 5:
      return 'Major'
    case 6:
      return 'Essential'
    case 7:
      return 'Universal'
    default:
      throw new Error(`Not a valid relevance: ${relevance}`)
  }
}

export const getFilteredParentGenres = <T extends TreeGenre>(
  genre: T,
  genreRelevanceFilter: number,
  genreMap: Map<number, T>
) =>
  uniqBy(
    (g) => g.id,
    genre.parentGenres
      .flatMap(({ id }) => {
        const parentGenre = genreMap.get(id)
        if (!parentGenre) return null
        if (parentGenre.relevance >= genreRelevanceFilter) return parentGenre

        const ancestors = []
        const stack = [...parentGenre.parentGenres]
        let curr = stack.pop()
        while (curr !== undefined) {
          const genre = genreMap.get(curr.id)
          if (!genre) continue

          if (genre.relevance >= genreRelevanceFilter) {
            ancestors.push(genre)
          } else {
            stack.push(...genre.parentGenres)
          }

          curr = stack.pop()
        }

        return ancestors
      })
      .filter(isNotNull)
  )

export const getFilteredChildGenres = <T extends TreeGenre>(
  genre: T,
  genreRelevanceFilter: number,
  genreMap: Map<number, T>
) =>
  uniqBy(
    (g) => g.id,
    genre.childGenres
      .flatMap(({ id, name }) => {
        const childGenre = genreMap.get(id)
        if (!childGenre) return null
        if (childGenre.relevance >= genreRelevanceFilter) return { id, name }

        const descendants = []
        const stack = [...childGenre.childGenres]
        let curr = stack.pop()
        while (curr !== undefined) {
          const genre = genreMap.get(curr.id)
          if (!genre) continue

          if (genre.relevance >= genreRelevanceFilter) {
            descendants.push({ id: genre.id, name: genre.name })
          } else {
            stack.push(...genre.childGenres)
          }

          curr = stack.pop()
        }

        return descendants
      })
      .filter(isNotNull)
  )

export const getFilteredInfluences = <T extends TreeGenre>(
  genre: T,
  genreRelevanceFilter: number,
  genreMap: Map<number, T>
) =>
  uniqBy(
    (g) => g.id,
    genre.influencedByGenres
      .flatMap(({ id }) => {
        const influence = genreMap.get(id)
        if (!influence) return null
        if (influence.relevance >= genreRelevanceFilter) return influence

        const ancestors = []
        const stack = [...influence.influencedByGenres]
        let curr = stack.pop()
        while (curr !== undefined) {
          const genre = genreMap.get(curr.id)
          if (!genre) continue

          if (genre.relevance >= genreRelevanceFilter) {
            ancestors.push(genre)
          } else {
            stack.push(...genre.influencedByGenres)
          }

          curr = stack.pop()
        }

        return ancestors
      })
      .filter(isNotNull)
  )
