import { uniqBy } from 'ramda'
import { useMemo } from 'react'

import { TreeGenre } from '../../../../server/db/genre/outputs'
import { useTreeGenresQuery } from '../../../../services/genres'
import { isNotNull } from '../../../../utils/types'
import useGenreNavigatorSettings from '../useGenreNavigatorSettings'

export type TreeNode = {
  path: number[]
  key: string
  genre: TreeGenre
  children: TreeNode[]
}

const useGenreTreeQuery = () => {
  const genresQuery = useTreeGenresQuery()
  const { genreRelevanceFilter } = useGenreNavigatorSettings()
  const treeQuery = useMemo(
    () => ({
      ...genresQuery,
      data:
        genresQuery.data && makeTree(genresQuery.data, genreRelevanceFilter),
    }),
    [genreRelevanceFilter, genresQuery]
  )
  return treeQuery
}

const makeTree = (genres: TreeGenre[], genreRelevanceFilter: number) => {
  const genreMap: Map<number, TreeGenre> = new Map(
    genres.map((genre) => [genre.id, genre])
  )

  const relevanceFilteredGenres: TreeGenre[] = genres
    .filter((genre) => genre.relevance >= genreRelevanceFilter)
    .map((genre) => {
      const filteredParentGenres = [
        ...new Set(
          genre.parentGenres
            .flatMap(({ id }) => {
              const parentGenre = genreMap.get(id)
              if (!parentGenre) return null
              if (parentGenre.relevance >= genreRelevanceFilter) return id

              const ancestors = []
              const stack = [...parentGenre.parentGenres]
              let curr = stack.pop()
              while (curr !== undefined) {
                const genre = genreMap.get(curr.id)
                if (!genre) continue

                if (genre.relevance >= genreRelevanceFilter) {
                  ancestors.push(genre.id)
                } else {
                  stack.push(...genre.parentGenres)
                }

                curr = stack.pop()
              }

              return ancestors
            })
            .filter(isNotNull)
        ),
      ].map((id) => ({ id }))

      const filteredChildGenres = uniqBy(
        (g) => g.id,
        genre.childGenres
          .flatMap(({ id, name }) => {
            const childGenre = genreMap.get(id)
            if (!childGenre) return null
            if (childGenre.relevance >= genreRelevanceFilter)
              return { id, name }

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

      return {
        ...genre,
        parentGenres: filteredParentGenres,
        childGenres: filteredChildGenres,
      }
    })

  const topLevelGenres = relevanceFilteredGenres.filter(
    (genre) => genre.parentGenres.length === 0
  )

  const relevanceFilteredGenreMap: Map<number, TreeGenre> = new Map(
    relevanceFilteredGenres.map((genre) => [genre.id, genre])
  )

  const makeNode = (genre: TreeGenre, parentPath?: number[]): TreeNode => {
    const path = [...(parentPath ?? []), genre.id]
    const key = path.join('-')
    return {
      path,
      key,
      genre,
      children: genre.childGenres
        .sort((a, b) =>
          a.name.toLowerCase().localeCompare(b.name.toLowerCase())
        )
        .map(({ id }) => {
          const childGenre = relevanceFilteredGenreMap.get(id)
          if (!childGenre) return null
          return makeNode(childGenre, path)
        })
        .filter(isNotNull),
    }
  }

  const nodes: TreeNode[] = topLevelGenres
    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
    .map((genre) => makeNode(genre))

  return nodes
}

export default useGenreTreeQuery
