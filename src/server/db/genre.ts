import { Prisma } from '@prisma/client'

export const defaultGenreSelect = Prisma.validator<Prisma.GenreSelect>()({
  id: true,
  name: true,
  shortDescription: true,
  longDescription: true,
  startDate: true,
  endDate: true,
  parentGenres: { select: { id: true, name: true } },
  childGenres: { select: { id: true, name: true } },
  x: true,
  y: true,
  contributors: { select: { id: true, username: true } },
})

export type DefaultGenre = Prisma.GenreGetPayload<{
  select: typeof defaultGenreSelect
}>
