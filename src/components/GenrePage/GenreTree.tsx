import { Permission } from '@prisma/client'
import Link from 'next/link'
import { FC, useMemo, useState } from 'react'

import { TreeGenre } from '../../server/db/genre/outputs'
import { useSession } from '../../services/auth'
import { useTreeGenresQuery } from '../../services/genres'
import { isNotNull } from '../../utils/types'
import { CenteredLoader } from '../common/Loader'
import { Expanded, Node, TreeContext } from './GenreTreeContext'
import GenreTreeNode from './GenreTreeNode'
import useGenreTreeSettings from './useGenreTreeSettings'

const GenreTree: FC<{
  selectedGenreId?: number
  scrollTo?: number
}> = ({ selectedGenreId, scrollTo }) => {
  const genresQuery = useTreeGenresQuery()

  if (genresQuery.data) {
    return (
      <Tree
        genres={genresQuery.data}
        selectedId={selectedGenreId}
        scrollTo={scrollTo}
      />
    )
  }

  if (genresQuery.error) {
    return (
      <div className='w-full h-full flex items-center justify-center text-red-600'>
        Error fetching genres :(
      </div>
    )
  }

  return <CenteredLoader />
}

const Tree: FC<{
  genres: TreeGenre[]
  selectedId?: number
  scrollTo?: number
}> = ({ genres: allGenres, selectedId, scrollTo }) => {
  const [expanded, setExpanded] = useState<Expanded>({})

  const { genreRelevanceFilter } = useGenreTreeSettings()

  const nodes = useMemo(() => {
    const genreMap: Map<number, TreeGenre> = new Map(
      allGenres.map((genre) => [genre.id, genre])
    )

    const relevanceFilteredGenres = allGenres
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

    const getDescendants = (id: number): number[] => {
      const descendants: number[] = []
      const queue = [id]

      while (queue.length > 0) {
        const currId = queue.shift()
        if (currId === undefined) break

        const currGenre = genreMap.get(currId)
        const childIds = (currGenre?.childGenres ?? []).map((g) => g.id) ?? []
        descendants.push(...childIds)
        queue.push(...childIds)
      }

      return descendants
    }

    const makeNode = (genre: TreeGenre, parentPath?: number[]): Node => {
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
        descendants: getDescendants(genre.id),
      }
    }

    const nodes: Node[] = topLevelGenres
      .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
      .map((genre) => makeNode(genre))

    return nodes
  }, [allGenres, genreRelevanceFilter])

  const session = useSession()

  return (
    <TreeContext.Provider
      value={{
        selectedId,
        scrollTo,
        expanded,
        setExpanded,
      }}
    >
      <div className='w-full h-full flex flex-col'>
        {nodes.length > 0 ? (
          <div className='flex-1 overflow-auto p-4'>
            <ul>
              {nodes.map((node) => (
                <GenreTreeNode key={node.key} node={node} />
              ))}
            </ul>
          </div>
        ) : (
          <div className='flex-1 w-full flex flex-col items-center justify-center text-gray-400'>
            <div>No genres found.</div>
            {session.isLoggedIn &&
              session.hasPermission(Permission.EDIT_GENRES) && (
                <div>
                  <Link href={{ pathname: '/genres/create' }}>
                    <a className='text-blue-500 hover:underline'>Create one.</a>
                  </Link>
                </div>
              )}
          </div>
        )}
      </div>
    </TreeContext.Provider>
  )
}

export default GenreTree
