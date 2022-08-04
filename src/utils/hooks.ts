import { useEffect, useMemo, useRef } from 'react'
import { DefaultGenre } from '../server/db/genre'

export const useAutoFocus = <T extends HTMLOrSVGElement>() => {
  const inputRef = useRef<T>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return inputRef
}

export const useGenreMap = (
  genres: DefaultGenre[]
): Record<number, DefaultGenre> =>
  useMemo(
    () => Object.fromEntries(genres.map((genre) => [genre.id, genre])),
    [genres]
  )
