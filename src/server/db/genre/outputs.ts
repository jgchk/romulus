import { Prisma } from '@prisma/client'

export { GenreType } from '@prisma/client'

export const defaultGenreSelect = Prisma.validator<Prisma.GenreSelect>()({
  id: true,
  name: true,
  subtitle: true,
  type: true,
  shortDescription: true,
  longDescription: true,
  notes: true,
  startDate: true,
  endDate: true,
  akas: true,
  oldAkas: true,
  relevance: true,
  parentGenres: { select: { id: true, name: true, type: true } },
  childGenres: { select: { id: true, name: true } },
  influencedByGenres: { select: { id: true, name: true, type: true } },
  influencesGenres: { select: { id: true, name: true } },
  x: true,
  y: true,
})
export type DefaultGenre = Prisma.GenreGetPayload<{
  select: typeof defaultGenreSelect
}>

export const simpleGenreSelect = Prisma.validator<Prisma.GenreSelect>()({
  id: true,
  name: true,
  subtitle: true,
  type: true,
  akas: true,
  relevance: true,
})
export type SimpleGenre = Prisma.GenreGetPayload<{
  select: typeof simpleGenreSelect
}>

export const treeGenreSelect = Prisma.validator<Prisma.GenreSelect>()({
  id: true,
  name: true,
  subtitle: true,
  type: true,
  akas: true,
  relevance: true,
  parentGenres: { select: { id: true } },
  childGenres: { select: { id: true, name: true } },
  influencedByGenres: { select: { id: true } },
})
export type TreeGenre = Prisma.GenreGetPayload<{
  select: typeof treeGenreSelect
}>
