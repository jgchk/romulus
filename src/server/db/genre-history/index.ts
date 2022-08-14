import { CrudOperation, Genre } from '@prisma/client'
import { TRPCError } from '@trpc/server'

import { prisma } from '../../prisma'

export const addGenreHistory = (
  genre: Omit<Genre, 'createdAt' | 'updatedAt'> & {
    parentGenres: { id: number }[]
    influencedByGenres: { id: number }[]
  },
  operation: CrudOperation,
  accountId: number
) =>
  prisma.genreHistory.create({
    data: {
      name: genre.name,
      type: genre.type,
      shortDescription: genre.shortDescription,
      longDescription: genre.longDescription,
      notes: genre.notes,
      startDate: genre.startDate,
      endDate: genre.endDate,
      akas: genre.akas,
      parentGenreIds: genre.parentGenres.map((g) => g.id),
      influencedByGenreIds: genre.influencedByGenres.map((g) => g.id),
      x: genre.x,
      y: genre.y,
      treeGenreId: genre.id,
      operation,
      accountId,
    },
  })

export const addGenreHistoryById = async (
  id: number,
  operation: CrudOperation,
  accountId: number
) => {
  const updatedGenre = await prisma.genre.findUnique({
    where: { id },
    include: {
      parentGenres: { select: { id: true } },
      childGenres: { select: { id: true } },
      influencedByGenres: { select: { id: true } },
      influencesGenres: { select: { id: true } },
    },
  })
  if (!updatedGenre) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `No genre with id '${id}'`,
    })
  }

  await addGenreHistory(updatedGenre, operation, accountId)
}
