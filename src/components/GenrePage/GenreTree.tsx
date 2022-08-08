import clsx from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FC, useCallback, useMemo } from 'react'

import { DefaultGenre } from '../../server/db/genre'
import { useSession } from '../../services/auth'
import { useGenresQuery } from '../../services/genres'
import { useGenreMap } from '../../utils/hooks'
import { ButtonSecondary } from '../common/Button'

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

  return (
    <div className='w-full h-full flex items-center justify-center text-gray-400'>
      Loading...
    </div>
  )
}

const Tree: FC<{ genres: DefaultGenre[]; selectedId?: number }> = ({
  genres,
  selectedId,
}) => {
  const topLevelGenres = useMemo(
    () => genres.filter((genre) => genre.parentGenres.length === 0),
    [genres]
  )

  const genreMap = useGenreMap(genres)

  const session = useSession()

  const renderGenre = useCallback(
    (genre: DefaultGenre) => (
      <li
        className={clsx(
          'ml-2',
          selectedId === genre.id
            ? 'text-blue-600 decoration-blue-600 font-bold'
            : 'text-gray-600 decoration-gray-600'
        )}
        key={genre.id}
      >
        <Link
          href={{
            pathname: '/genres/[id]',
            query: { id: genre.id.toString() },
          }}
        >
          <a>{genre.name}</a>
        </Link>
        {genre.childGenres.length > 0 && (
          <ul className='list-disc list-inside'>
            {genre.childGenres.map(({ id }) => {
              const childGenre = genreMap[id]
              return renderGenre(childGenre)
            })}
          </ul>
        )}
      </li>
    ),
    [genreMap, selectedId]
  )

  if (genres.length === 0) {
    return (
      <div className='w-full h-full flex flex-col items-center justify-center text-gray-400'>
        <div>No genres found.</div>
        {session.isLoggedIn && (
          <div>
            <Link href={{ pathname: '/genres/create' }}>
              <a className='text-blue-500 hover:underline'>Create one.</a>
            </Link>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className='w-full h-full'>
      <ul className='list-disc list-inside'>
        {topLevelGenres.map((genre) => renderGenre(genre))}
      </ul>
    </div>
  )
}

export default GenreTree
