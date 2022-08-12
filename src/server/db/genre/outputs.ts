import { Prisma } from '@prisma/client'

export { GenreType } from '@prisma/client'

export const defaultGenreSelect = Prisma.validator<Prisma.GenreSelect>()({
  id: true,
  name: true,
  type: true,
  shortDescription: true,
  longDescription: true,
  notes: true,
  startDate: true,
  endDate: true,
  akas: true,
  parentGenres: { select: { id: true, name: true } },
  childGenres: { select: { id: true, name: true } },
  influencedByGenres: { select: { id: true, name: true } },
  influencesGenres: { select: { id: true, name: true } },
  x: true,
  y: true,
})

export type DefaultGenre = Prisma.GenreGetPayload<{
  select: typeof defaultGenreSelect
}>
