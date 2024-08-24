import { omit } from 'ramda'

import type { IDrizzleConnection } from '$lib/server/db/connection'
import { GenresDatabase } from '$lib/server/db/controllers/genre'
import { GenreHistoryDatabase } from '$lib/server/db/controllers/genre-history'
import { GenreRelevanceVotesDatabase } from '$lib/server/db/controllers/genre-relevance-votes'
import { UNSET_GENRE_RELEVANCE } from '$lib/types/genres'

import type { Account } from '../../db/schema'
import type { GenreData } from './types'

export async function createGenre(
  data: GenreData,
  accountId: Account['id'],
  dbConnection: IDrizzleConnection,
): Promise<number> {
  const genresDb = new GenresDatabase()
  const genreHistoryDb = new GenreHistoryDatabase()
  const genreRelevanceVotesDb = new GenreRelevanceVotesDatabase()

  const genre = await dbConnection.transaction(async (tx) => {
    const [genre] = await genresDb.insert(
      [
        {
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
        },
      ],
      tx,
    )

    await genreHistoryDb.insert(
      [
        {
          ...omit(['id', 'parents', 'influencedBy', 'createdAt', 'updatedAt'], genre),
          treeGenreId: genre.id,
          parentGenreIds: genre.parents,
          influencedByGenreIds: genre.influencedBy,
          operation: 'CREATE',
          accountId,
          akas: genre.akas,
        },
      ],
      tx,
    )

    if (data.relevance !== undefined && data.relevance !== UNSET_GENRE_RELEVANCE) {
      await genreRelevanceVotesDb.upsert(
        {
          genreId: genre.id,
          accountId,
          relevance: data.relevance,
          updatedAt: new Date(),
        },
        tx,
      )
    }

    return genre
  })

  return genre.id
}
