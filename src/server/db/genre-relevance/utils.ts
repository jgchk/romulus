import { median } from 'ramda'

import { prisma } from '../../prisma'
import { getByGenreId } from '.'

export const getRelevanceFromVotes = (votes: number[]) =>
  Math.round(median(votes))

export const updateRelevance = async (genreId: number) => {
  const votes = await getByGenreId(genreId)
  const relevance = getRelevanceFromVotes(votes.map((vote) => vote.relevance))
  await prisma.genre.update({
    where: { id: genreId },
    data: { relevance },
  })
}
