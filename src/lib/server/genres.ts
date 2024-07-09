import { UNSET_GENRE_RELEVANCE } from '$lib/types/genres'
import { median } from '$lib/utils/math'

import { db } from './db'

export class GenreCycleError extends Error {
  constructor(public cycle: string) {
    super(`Cycle detected: ${cycle}`)
  }
}

export async function setRelevanceVote(id: number, relevance: number, accountId: number) {
  if (relevance === UNSET_GENRE_RELEVANCE) {
    await db.genreRelevanceVotes.deleteByGenreId(id)
    await updateRelevance(id)
    return
  }

  await db.genreRelevanceVotes.upsert({
    genreId: id,
    accountId,
    relevance,
    updatedAt: new Date(),
  })

  await updateRelevance(id)
}

async function updateRelevance(genreId: number) {
  const votes = await db.genreRelevanceVotes.findByGenreId(genreId)

  const relevance =
    votes.length === 0
      ? UNSET_GENRE_RELEVANCE
      : Math.round(median(votes.map((vote) => vote.relevance)))

  await db.genres.update(genreId, { relevance })
}
