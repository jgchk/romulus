import anyAscii from 'any-ascii'
import clsx from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FC, useCallback, useMemo, useState } from 'react'
import { RiArrowDownSLine, RiArrowRightSLine } from 'react-icons/ri'

import { DefaultGenre } from '../../server/db/genre'
import { useSession } from '../../services/auth'
import { useGenresQuery } from '../../services/genres'
import { useGenreMap } from '../../utils/hooks'
import { ButtonSecondary } from '../common/Button'
import { CenteredLoader } from '../common/Loader'

const GenreTree: FC<{
  selectedGenreId?: number
}> = ({ selectedGenreId }) => {
  const genresQuery = useGenresQuery()
  const session = useSession()
  const router = useRouter()

  if (genresQuery.data) {
    return (
      <div className='w-full h-full flex flex-col'>
        <div className='flex-1 p-4 overflow-auto'>
          <Tree genres={genresQuery.data} selectedId={selectedGenreId} />
        </div>
        {session.isLoggedIn && (
          <div className='p-1 border-t'>
            <ButtonSecondary
              className='w-full'
              onClick={() => router.push({ pathname: '/genres/create' })}
            >
              New Genre
            </ButtonSecondary>
          </div>
        )}
      </div>
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

const Tree: FC<{ genres: DefaultGenre[]; selectedId?: number }> = ({
  genres: unsortedGenres,
  selectedId,
}) => {
  const [expanded, setExpanded] = useState<
    Record<number, 'expanded' | 'collapsed' | undefined>
  >({})
  const [filter, setFilter] = useState('')

  const genreMap = useGenreMap(unsortedGenres)

  const getDescendants = useCallback(
    (id: number) => {
      const descendants: number[] = []
      const queue = [id]

      while (queue.length > 0) {
        const currId = queue.shift()
        if (currId === undefined) break

        const currGenre = genreMap[currId]
        const childIds = currGenre.childGenres.map((g) => g.id)
        descendants.push(...childIds)
        queue.push(...childIds)
      }

      return descendants
    },
    [genreMap]
  )

  const getMatchesFilter = useCallback(
    (id: number) => {
      if (!filter) return false

      const genre = genreMap[id]
      return anyAscii(genre.name.toLowerCase()).includes(
        anyAscii(filter.toLowerCase())
      )
    },
    [filter, genreMap]
  )

  const genres = useMemo(() => {
    let gs = unsortedGenres
    if (filter) {
      gs = gs.filter((g) => {
        const descendants = getDescendants(g.id)
        return [g.id, ...descendants].some((id) => getMatchesFilter(id))
      })
    }
    return gs.sort((a, b) => a.name.localeCompare(b.name))
  }, [filter, getDescendants, getMatchesFilter, unsortedGenres])

  const topLevelGenres = useMemo(
    () => genres.filter((genre) => genre.parentGenres.length === 0),
    [genres]
  )

  const session = useSession()

  const renderGenre = useCallback(
    (genre: DefaultGenre) => {
      const isExpanded =
        expanded[genre.id] === 'expanded' ||
        (expanded[genre.id] === undefined &&
          getDescendants(genre.id).some((id) => getMatchesFilter(id)))

      return (
        <li
          className={clsx(
            genre.parentGenres.length > 0 && 'ml-4 border-l',
            genre.parentGenres.some(({ id }) => selectedId === id) &&
              'border-gray-400'
          )}
          key={genre.id}
        >
          <div className='ml-1 flex space-x-1'>
            <button
              className={clsx(
                'p-1 hover:bg-blue-100 hover:text-blue-600 rounded-sm text-gray-500',
                genre.childGenres.length === 0 && 'invisible'
              )}
              onClick={() =>
                setExpanded({
                  ...expanded,
                  [genre.id]: isExpanded ? 'collapsed' : 'expanded',
                })
              }
            >
              {isExpanded ? <RiArrowDownSLine /> : <RiArrowRightSLine />}
            </button>
            <Link
              href={{
                pathname: '/genres/[id]',
                query: { id: genre.id.toString() },
              }}
            >
              <a
                className={
                  selectedId === genre.id
                    ? 'text-blue-600 font-bold'
                    : 'text-gray-600'
                }
              >
                {genre.name}
              </a>
            </Link>
          </div>
          {genre.childGenres.length > 0 && isExpanded && (
            <ul>
              {genre.childGenres.map(({ id }) => renderGenre(genreMap[id]))}
            </ul>
          )}
        </li>
      )
    },
    [expanded, genreMap, getDescendants, getMatchesFilter, selectedId]
  )

  return (
    <div className='w-full h-full flex flex-col'>
      <input
        className='border rounded-sm p-1 px-2 mb-2 w-full'
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder='Filter...'
      />
      {genres.length > 0 ? (
        <ul>{topLevelGenres.map((genre) => renderGenre(genre))}</ul>
      ) : (
        <div className='flex-1 w-full flex flex-col items-center justify-center text-gray-400'>
          <div>No genres found.</div>
          {session.isLoggedIn && (
            <div>
              <Link href={{ pathname: '/genres/create' }}>
                <a className='text-blue-500 hover:underline'>Create one.</a>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default GenreTree
