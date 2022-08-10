import { useMemo } from 'react'

import { DefaultGenre } from '../server/db/genre/types'

export type GenreMap = Record<number, DefaultGenre>

export const useGenreMap = (genres: DefaultGenre[]): GenreMap =>
  useMemo(
    () => Object.fromEntries(genres.map((genre) => [genre.id, genre])),
    [genres]
  )

export default useGenreMap
