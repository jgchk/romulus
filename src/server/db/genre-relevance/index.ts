import { Prisma } from '@prisma/client'

import { prisma } from '../../prisma'
import { UNSET_GENRE_RELEVANCE } from '../common/inputs'
import {
  DeleteGenreRelevanceVoteInput,
  GenreRelevanceVoteInput,
} from './inputs'
import { defaultGenreRelevanceVoteSelect } from './outputs'
import { updateRelevance } from './utils'

export const getByGenreId = async (genreId: number) =>
  prisma.genreRelevanceVote.findMany({
    where: { genreId },
    select: defaultGenreRelevanceVoteSelect,
  })

export const getByGenreIdForAccount = async (
  genreId: number,
  accountId: number
) =>
  prisma.genreRelevanceVote.findUnique({
    where: { genreId_accountId: { genreId, accountId } },
    select: defaultGenreRelevanceVoteSelect,
  })

export const setGenreRelevanceVote = async (
  input: GenreRelevanceVoteInput,
  accountId: number
) => {
  if (input.relevance === UNSET_GENRE_RELEVANCE) {
    await deleteGenreRelevanceVote({ genreId: input.genreId }, accountId)
    return null
  }

  const vote = await prisma.genreRelevanceVote.upsert({
    where: {
      genreId_accountId: { genreId: input.genreId, accountId },
    },
    create: { ...input, accountId },
    update: { ...input, accountId },
    select: defaultGenreRelevanceVoteSelect,
  })

  await updateRelevance(input.genreId)

  return vote
}

export const deleteGenreRelevanceVote = async (
  input: DeleteGenreRelevanceVoteInput,
  accountId: number
) => {
  try {
    await prisma.genreRelevanceVote.delete({
      where: { genreId_accountId: { genreId: input.genreId, accountId } },
    })

    await updateRelevance(input.genreId)
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return { status: 'Already deleted' }
    } else {
      throw error
    }
  }

  return { status: 'Deleted' }
}
