import { Permission } from '@prisma/client'
import Link from 'next/link'
import { FC, useMemo, useState } from 'react'

import useGenreMap from '../../hooks/useGenreMap'
import { DefaultGenre } from '../../server/db/genre/outputs'
import { useSession } from '../../services/auth'
import { useGenresQuery } from '../../services/genres'
import { CenteredLoader } from '../common/Loader'
import { Descendants, Expanded, TreeContext } from './GenreTreeContext'
import GenreTreeNode from './GenreTreeNode'

const GenreTree: FC<{
  selectedGenreId?: number
}> = ({ selectedGenreId }) => {
  const genresQuery = useGenresQuery()

  if (genresQuery.data) {
    return <Tree genres={genresQuery.data} selectedId={selectedGenreId} />
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

const Tree: FC<{ genres: DefaultGenre[]; selectedId?: number }> = ({
  genres: allGenres,
  selectedId,
}) => {
  const [expanded, setExpanded] = useState<Expanded>({})

  const genreMap = useGenreMap(allGenres)

  const descendants: Descendants = useMemo(() => {
    const getDescendants = (id: number) => {
      const descendants: number[] = []
      const queue = [id]

      while (queue.length > 0) {
        const currId = queue.shift()
        if (currId === undefined) break

        const currGenre = genreMap[currId]
        const childIds = (currGenre?.childGenres ?? []).map((g) => g.id) ?? []
        descendants.push(...childIds)
        queue.push(...childIds)
      }

      return descendants
    }

    return Object.fromEntries(
      Object.values(genreMap).map((genre) => [
        genre.id,
        getDescendants(genre.id),
      ])
    )
  }, [genreMap])

  const topLevelGenres = useMemo(
    () =>
      Object.values(genreMap)
        .filter((genre) => genre.parentGenres.length === 0)
        .sort((a, b) =>
          a.name.toLowerCase().localeCompare(b.name.toLowerCase())
        ),
    [genreMap]
  )

  const session = useSession()

  return (
    <TreeContext.Provider
      value={{
        selectedId,
        genreMap,
        expanded,
        setExpanded,
        descendants,
      }}
    >
      <div className='w-full h-full flex flex-col'>
        {topLevelGenres.length > 0 ? (
          <div className='flex-1 overflow-auto p-4'>
            <ul>
              {topLevelGenres.map((genre) => (
                <GenreTreeNode key={genre.id} id={genre.id} />
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
