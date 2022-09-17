import { Prisma } from '@prisma/client'

export const defaultGenreHistorySelect =
  Prisma.validator<Prisma.GenreHistorySelect>()({
    id: true,
    name: true,
    subtitle: true,
    type: true,
    shortDescription: true,
    longDescription: true,
    notes: true,
    akas: true,
    parentGenreIds: true,
    influencedByGenreIds: true,
    treeGenreId: true,
    operation: true,
    account: { select: { id: true, username: true } },
    createdAt: true,
  })

export type DefaultGenreHistory = Prisma.GenreHistoryGetPayload<{
  select: typeof defaultGenreHistorySelect
}>
