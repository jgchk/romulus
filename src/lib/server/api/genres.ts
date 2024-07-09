import { omit } from 'ramda'

import { UNSET_GENRE_RELEVANCE } from '$lib/types/genres'

import type { Account } from '../db/schema'
import type { GenreData } from '../db/utils'
import type { IDatabase } from '../db/wrapper'

export async function createGenre(data: GenreData, accountId: Account['id'], db: IDatabase) {
  const [genre] = await db.genres.insert({
    ...data,
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
    updatedAt: new Date(),
  })

  await db.genreHistory.insert({
    ...omit(['id', 'parents', 'influencedBy', 'createdAt', 'updatedAt'], genre),
    treeGenreId: genre.id,
    parentGenreIds: genre.parents.map((parent) => parent.parentId),
    influencedByGenreIds: genre.influencedBy.map((influencer) => influencer.influencerId),
    operation: 'CREATE',
    accountId,
    akas: genre.akas,
  })

  if (data.relevance !== undefined && data.relevance !== UNSET_GENRE_RELEVANCE) {
    await db.genreRelevanceVotes.upsert({
      genreId: genre.id,
      accountId,
      relevance: data.relevance,
      updatedAt: new Date(),
    })
  }

  return {
    ...genre,
    parents: genre.parents.map(({ parentId }) => parentId),
    influencedBy: genre.influencedBy.map(({ influencerId }) => influencerId),
  }
}
