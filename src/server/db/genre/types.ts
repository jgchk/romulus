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
  contributors: { select: { id: true, username: true } },
})

export const defaultGenreHistorySelect =
  Prisma.validator<Prisma.GenreHistorySelect>()({
    id: true,
    name: true,
    type: true,
    shortDescription: true,
    longDescription: true,
    notes: true,
    startDate: true,
    endDate: true,
    akas: true,
    parentGenreIds: true,
    childGenreIds: true,
    influencedByGenreIds: true,
    influencesGenreIds: true,
    x: true,
    y: true,
    treeGenreId: true,
    operation: true,
    account: { select: { id: true, username: true } },
    createdAt: true,
  })

export type DefaultGenre = Prisma.GenreGetPayload<{
  select: typeof defaultGenreSelect
}>

export type DefaultGenreHistory = Prisma.GenreHistoryGetPayload<{
  select: typeof defaultGenreHistorySelect
}> & { treeGenre: { id: number; name: string } }
