import { Prisma } from '@prisma/client'

export const defaultGenreSelect = Prisma.validator<Prisma.GenreSelect>()({
  id: true,
  name: true,
  description: true,
})

export type DefaultGenre = Prisma.GenreGetPayload<{
  select: typeof defaultGenreSelect
}>
