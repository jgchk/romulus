import { useMemo } from 'react'

import { TreeGenre } from '../../../../server/db/genre/outputs'
import { useTreeGenresMapQuery } from '../../../../services/genres'
import { isNotNull } from '../../../../utils/types'
import { getFilteredChildGenres, getFilteredParentGenres } from '../../utils'
import useGenreNavigatorSettings from '../useGenreNavigatorSettings'

export type TreeNode = {
  path: number[]
  key: string
  genre: TreeGenre
  children: TreeNode[]
}

const useGenreTreeQuery = () => {
  const genreMapQuery = useTreeGenresMapQuery()
  const { genreRelevanceFilter } = useGenreNavigatorSettings()
  const treeQuery = useMemo(
    () => ({
      ...genreMapQuery,
      data:
        genreMapQuery.data &&
        makeTree(genreMapQuery.data, genreRelevanceFilter),
    }),
    [genreMapQuery, genreRelevanceFilter]
  )
  return treeQuery
}

const makeTree = (
  genreMap: Map<number, TreeGenre>,
  genreRelevanceFilter: number
) => {
  const relevanceFilteredGenres: TreeGenre[] = [...genreMap.values()]
    .filter((genre) => genre.relevance >= genreRelevanceFilter)
    .map((genre) => ({
      ...genre,
      parentGenres: getFilteredParentGenres(
        genre,
        genreRelevanceFilter,
        genreMap
      ),
      childGenres: getFilteredChildGenres(
        genre,
        genreRelevanceFilter,
        genreMap
      ),
    }))

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
