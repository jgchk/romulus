import { useMemo } from 'react'

import useLocalStorage from '../../hooks/useLocalStorage'
import { GenreType } from '../../server/db/genre/outputs'

export const genreTypeColors: Record<GenreType, string> = {
  MOVEMENT: 'text-rose-500',
  META: 'text-purple-500',
  STYLE: 'text-blue-500',
  SCENE: 'text-emerald-500',
  TREND: 'text-orange-500',
}

export const genreTypeBgColors: Record<GenreType, string> = {
  MOVEMENT: 'bg-rose-100',
  META: 'bg-purple-100',
  STYLE: 'bg-blue-100',
  SCENE: 'bg-emerald-100',
  TREND: 'bg-orange-100',
}

export const useGenreTreeSettings = () => {
  const [showTypeTags, setShowTypeTags] = useLocalStorage(
    'settings.genreTree.showTypeTags',
    true
  )

  const data = useMemo(
    () => ({
      showTypeTags,
      setShowTypeTags,
    }),
    [setShowTypeTags, showTypeTags]
  )

  return data
}
