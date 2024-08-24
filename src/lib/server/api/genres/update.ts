import type { IDrizzleConnection } from '$lib/server/db/connection'
import { GenreService } from '$lib/server/ddd/features/genres/application/genre-service'
import { DrizzleGenreRepository } from '$lib/server/ddd/features/genres/infrastructure/genre/drizzle-genre-repository'
import { DrizzleGenreHistoryRepository } from '$lib/server/ddd/features/genres/infrastructure/genre-history/drizzle-genre-history-repository'

import type { Account, Genre } from '../../db/schema'
import { type GenreData } from './types'

export async function updateGenre(
  id: Genre['id'],
  data: GenreData,
  accountId: Account['id'],
  dbConnection: IDrizzleConnection,
): Promise<void> {
  const genreService = new GenreService(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
  )

  await genreService.updateGenre(
    id,
    {
      ...data,
      parents: new Set(data.parents),
      influences: new Set(data.influencedBy),
      akas: {
        primary: data.primaryAkas?.length
          ? data.primaryAkas?.split(',').map((aka) => aka.trim())
          : [],
        secondary: data.secondaryAkas?.length
          ? data.secondaryAkas?.split(',').map((aka) => aka.trim())
          : [],
        tertiary: data.tertiaryAkas?.length
          ? data.tertiaryAkas?.split(',').map((aka) => aka.trim())
          : [],
      },
    },
    accountId,
  )
}
