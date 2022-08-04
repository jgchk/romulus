import { FC, useCallback, useMemo, useState } from 'react'
import { DefaultGenre } from '../server/db/genre'
import { useGenreMap } from '../utils/hooks'
import ViewGenreDialog from './ViewGenreDialog'

const GenreTree: FC<{ genres: DefaultGenre[] }> = ({ genres }) => {
  const [viewingGenreId, setViewingGenreId] = useState<number>()

  const topLevelGenres = useMemo(
    () => genres.filter((genre) => genre.parentGenres.length === 0),
    [genres]
  )

  const genreMap = useGenreMap(genres)

  const renderGenre = useCallback(
    (genre: DefaultGenre) => {
      return (
        <li className='ml-2' key={genre.id}>
          <button onClick={() => setViewingGenreId(genre.id)}>
            {genre.name}
          </button>
          {genre.childGenres.length > 0 && (
            <ul>
              {genre.childGenres.map(({ id }) => {
                const childGenre = genreMap[id]
                return renderGenre(childGenre)
              })}
            </ul>
          )}
        </li>
      )
    },
    [genreMap]
  )

  if (genres.length === 0) {
    return <div>No genres found</div>
  }

  return (
    <>
      <div>
        <ul>{topLevelGenres.map((genre) => renderGenre(genre))}</ul>
      </div>

      {viewingGenreId && (
        <ViewGenreDialog
          id={viewingGenreId}
          onClose={() => setViewingGenreId(undefined)}
          onClickGenre={(id) => setViewingGenreId(id)}
        />
      )}
    </>
  )
}

export default GenreTree
