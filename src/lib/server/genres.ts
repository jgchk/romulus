import { eq } from 'drizzle-orm'

import { UNSET_GENRE_RELEVANCE } from '$lib/types/genres'
import { median } from '$lib/utils/math'

import { db } from './db'
import { genreAkas, genreInfluences, genreParents, genreRelevanceVotes, genres } from './db/schema'
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

  const genre = await db.transaction(async (tx) => {
    // create genre
    const [genre] = await tx
      .insert(genres)
      .values({
        name: data.name,
        shortDescription: data.shortDescription,
        longDescription: data.longDescription,
        notes: data.notes,
        type: data.type,
        subtitle: data.subtitle,
        updatedAt: new Date(),
      })
      .returning()

    // create akas
    const akas = [
      ...(data.primaryAkas ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map((name, order) => ({ genreId: genre.id, name, relevance: 3, order })),
      ...(data.secondaryAkas ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map((name, order) => ({ genreId: genre.id, name, relevance: 2, order })),
      ...(data.tertiaryAkas ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map((name, order) => ({ genreId: genre.id, name, relevance: 1, order })),
    ]
    if (akas.length > 0) {
      await tx.insert(genreAkas).values(akas)
    }

    // create parents
    if (data.parents.length > 0) {
      await tx
        .insert(genreParents)
        .values(data.parents.map((parentId) => ({ parentId, childId: genre.id })))
    }

    // create influences
    if (data.influencedBy.length > 0) {
      await tx.insert(genreInfluences).values(
        data.influencedBy.map((influencerId) => ({
          influencerId,
          influencedId: genre.id,
        })),
      )
    }

    await createGenreHistoryEntry({
      genre: {
        ...genre,
        parents: data.parents.map((parentId) => ({ parentId })),
        influencedBy: data.influencedBy.map((influencerId) => ({ influencerId })),
        akas,
      },
      accountId,
      operation: 'CREATE',
      db: tx,
    })

    return genre
  })

  return genre
}

export async function setRelevanceVote(id: number, relevance: number, accountId: number) {
  if (relevance === UNSET_GENRE_RELEVANCE) {
    await db.delete(genreRelevanceVotes).where(eq(genreRelevanceVotes.genreId, id))
    await updateRelevance(id)
    return
  }

  await db
    .insert(genreRelevanceVotes)
    .values({
      genreId: id,
      accountId,
      relevance,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [genreRelevanceVotes.genreId, genreRelevanceVotes.accountId],
      set: {
        relevance,
        updatedAt: new Date(),
      },
    })

  await updateRelevance(id)
}

async function updateRelevance(genreId: number) {
  const votes = await db.query.genreRelevanceVotes.findMany({
    where: eq(genreRelevanceVotes.genreId, genreId),
  })

  const relevance =
    votes.length === 0
      ? UNSET_GENRE_RELEVANCE
      : Math.round(median(votes.map((vote) => vote.relevance)))

  await db.update(genres).set({ relevance }).where(eq(genres.id, genreId))
}
