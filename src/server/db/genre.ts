import { Prisma } from '@prisma/client'

export const defaultGenreSelect = Prisma.validator<Prisma.GenreSelect>()({
  id: true,
  name: true,
  description: true,
  startDate: true,
  endDate: true,
  parentGenres: { select: { id: true, name: true } },
  childGenres: { select: { id: true, name: true } },
  x: true,
  y: true,
})

export type DefaultGenre = Prisma.GenreGetPayload<{
  select: typeof defaultGenreSelect
}>
