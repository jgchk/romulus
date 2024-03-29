import { prisma } from '../../prisma'
import { CrudOperation, Genre, GenreAka } from '@prisma/client'
import { TRPCError } from '@trpc/server'

export const addGenreHistory = (
  genre: Omit<Genre, 'createdAt' | 'updatedAt'> & {
    parentGenres: { id: number }[]
    influencedByGenres: { id: number }[]
    akas: GenreAka[]
  },
  operation: CrudOperation,
  accountId: number,
) =>
  prisma.genreHistory.create({
    data: {
      name: genre.name,
      subtitle: genre.subtitle,
      type: genre.type,
      shortDescription: genre.shortDescription,
      longDescription: genre.longDescription,
      notes: genre.notes,
      akas: {
        create: genre.akas.map((aka) => ({
          name: aka.name,
          relevance: aka.relevance,
          order: aka.order,
        })),
      },
      parentGenreIds: genre.parentGenres.map((g) => g.id),
      influencedByGenreIds: genre.influencedByGenres.map((g) => g.id),
      treeGenreId: genre.id,
      operation,
      accountId,
    },
  })

export const addGenreHistoryById = async (
  id: number,
  operation: CrudOperation,
  accountId: number,
) => {
  const updatedGenre = await prisma.genre.findUnique({
    where: { id },
    include: {
      akas: true,
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
