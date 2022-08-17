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

export const getGenreRelevanceText = (relevance: number) => {
  switch (relevance) {
    case 1:
      return 'Unknown'
    case 2:
      return 'Unestablished'
    case 3:
      return 'Minor'
    case 4:
      return 'Significant'
    case 5:
      return 'Major'
    case 6:
      return 'Essential'
    case 7:
      return 'Universal'
    default:
      throw new Error(`Not a valid relevance: ${relevance}`)
  }
}
