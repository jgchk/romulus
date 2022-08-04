import { Prisma } from '@prisma/client'

export const defaultGenreSelect = Prisma.validator<Prisma.GenreSelect>()({
  id: true,
  name: true,
  description: true,
  parentGenres: { select: { id: true } },
  childGenres: { select: { id: true } },
})

export type DefaultGenre = Prisma.GenreGetPayload<{
  select: typeof defaultGenreSelect
}>
