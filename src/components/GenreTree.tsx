import { FC, useCallback, useMemo } from 'react'
import { DefaultGenre } from '../server/db/genre'
import { useGenreMap } from '../utils/hooks'

const GenreTree: FC<{ genres: DefaultGenre[] }> = ({ genres }) => {
  const topLevelGenres = useMemo(
    () => genres.filter((genre) => genre.parentGenres.length === 0),
    [genres]
  )

  const genreMap = useGenreMap(genres)

  const renderGenre = useCallback(
    (genre: DefaultGenre) => {
      return (
        <li className='ml-2' key={genre.id}>
          {genre.name}
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
    <div>
      <ul>{topLevelGenres.map((genre) => renderGenre(genre))}</ul>
    </div>
  )
}

export default GenreTree
