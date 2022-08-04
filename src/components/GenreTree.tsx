import clsx from 'clsx'
import { FC, useCallback, useMemo } from 'react'

import { DefaultGenre } from '../server/db/genre'
import { useGenreMap } from '../utils/hooks'

const GenreTree: FC<{
  genres: DefaultGenre[]
  onClickGenre: (id: number) => void
  selectedId?: number
}> = ({ genres, onClickGenre, selectedId }) => {
  const topLevelGenres = useMemo(
    () => genres.filter((genre) => genre.parentGenres.length === 0),
    [genres]
  )

  const genreMap = useGenreMap(genres)

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
        <button className={clsx()} onClick={() => onClickGenre(genre.id)}>
          {genre.name}
        </button>
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
    [genreMap, onClickGenre, selectedId]
  )

  if (genres.length === 0) {
    return (
      <div className='w-full h-full flex items-center justify-center text-gray-400'>
        No genres found
      </div>
    )
  }

  return (
    <div className='w-full h-full p-4'>
      <ul className='list-disc list-inside'>
        {topLevelGenres.map((genre) => renderGenre(genre))}
      </ul>
    </div>
  )
}

export default GenreTree
