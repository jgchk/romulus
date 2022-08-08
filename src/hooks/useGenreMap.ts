import { useMemo } from 'react'

import { DefaultGenre } from '../server/db/genre'

export const useGenreMap = (
  genres: DefaultGenre[]
): Record<number, DefaultGenre> =>
  useMemo(
    () => Object.fromEntries(genres.map((genre) => [genre.id, genre])),
    [genres]
  )

export default useGenreMap
