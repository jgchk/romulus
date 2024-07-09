import { UNSET_GENRE_RELEVANCE } from '$lib/types/genres'
import { median } from '$lib/utils/math'

import { db } from './db'
import { createGenreHistoryEntry, detectCycle, type GenreData } from './db/utils'

export class GenreCycleError extends Error {
  constructor(public cycle: string) {
    super(`Cycle detected: ${cycle}`)
  }
}

export async function createGenre(data: GenreData, accountId: number) {
  const cycle = await detectCycle({ name: data.name, parents: data.parents })
  if (cycle) {
    throw new GenreCycleError(cycle)
  }

  return db.transaction(async (tx) => {
    const [genre] = await tx.genres.insert({
      ...data,
      updatedAt: new Date(),
      akas: [
        ...(data.primaryAkas ?? '')
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
          .map((name, order) => ({ name, relevance: 3, order })),
        ...(data.secondaryAkas ?? '')
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
          .map((name, order) => ({ name, relevance: 2, order })),
        ...(data.tertiaryAkas ?? '')
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
          .map((name, order) => ({ name, relevance: 1, order })),
      ],
    })

    await createGenreHistoryEntry({
      genre,
      accountId,
      operation: 'CREATE',
      db: tx,
    })

    return genre
  })
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
