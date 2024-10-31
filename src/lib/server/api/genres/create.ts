import type { IDrizzleConnection } from '$lib/server/db/connection'
import { CreateGenreCommand } from '$lib/server/features/genres/commands/application/commands/create-genre'
import { DrizzleGenreRelevanceVoteRepository } from '$lib/server/features/genres/commands/infrastructure/drizzle-genre-relevance-vote-repository'
import { DrizzleGenreRepository } from '$lib/server/features/genres/commands/infrastructure/genre/drizzle-genre-repository'
import { DrizzleGenreHistoryRepository } from '$lib/server/features/genres/commands/infrastructure/genre-history/drizzle-genre-history-repository'
import { UNSET_GENRE_RELEVANCE } from '$lib/types/genres'

import type { Account } from '../../db/schema'
import type { GenreData } from './types'

export async function createGenre(
  data: GenreData,
  accountId: Account['id'],
  dbConnection: IDrizzleConnection,
): Promise<number> {
  const createGenreCommand = new CreateGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
    new DrizzleGenreRelevanceVoteRepository(dbConnection),
  )

  const { id } = await createGenreCommand.execute(
    {
      ...data,
      subtitle: data.subtitle ?? undefined,
      shortDescription: data.shortDescription ?? undefined,
      longDescription: data.longDescription ?? undefined,
      notes: data.notes ?? undefined,
      relevance: data.relevance ?? UNSET_GENRE_RELEVANCE,
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
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    accountId,
  )

  return id
}
