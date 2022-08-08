import { GenreType } from '@prisma/client'

export const genreTypeColors: Record<GenreType, string> = {
  MOVEMENT: 'text-rose-500',
  META: 'text-purple-500',
  STYLE: 'text-blue-500',
  SCENE: 'text-emerald-500',
  TREND: 'text-orange-500',
}
