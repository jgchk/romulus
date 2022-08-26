import { useMemo } from 'react'

import { TreeGenre } from '../../server/db/genre/outputs'
import { useTreeGenresQuery } from '../../services/genres'
import { isNotNull } from '../../utils/types'
import useGenreTreeSettings from './useGenreTreeSettings'

export type TreeNode = {
  path: number[]
  key: string
  genre: TreeGenre
  children: TreeNode[]
}

const useGenreTreeQuery = () => {
  const genresQuery = useTreeGenresQuery()
  const { genreRelevanceFilter } = useGenreTreeSettings()
  const treeQuery = {
    ...genresQuery,
    data: useMemo(
      () =>
        genresQuery.data && makeTree(genresQuery.data, genreRelevanceFilter),
      [genreRelevanceFilter, genresQuery.data]
    ),
  }
  return treeQuery
}

const makeTree = (genres: TreeGenre[], genreRelevanceFilter: number) => {
  const genreMap: Map<number, TreeGenre> = new Map(
    genres.map((genre) => [genre.id, genre])
  )

  const relevanceFilteredGenres = genres
    .filter((genre) => genre.relevance >= genreRelevanceFilter)
    .map((genre) => {
      const filteredParentGenres = genre.parentGenres.filter(({ id }) => {
        const parentGenre = genreMap.get(id)
        return parentGenre && parentGenre.relevance >= genreRelevanceFilter
      })
      const filteredChildGenres = genre.childGenres.filter(({ id }) => {
        const childGenre = genreMap.get(id)
        return childGenre && childGenre.relevance >= genreRelevanceFilter
      })
      return {
        ...genre,
        parentGenres: filteredParentGenres,
        childGenres: filteredChildGenres,
      }
    })

  const topLevelGenres = relevanceFilteredGenres.filter(
    (genre) => genre.parentGenres.length === 0
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
          const childGenre = genreMap.get(id)
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
