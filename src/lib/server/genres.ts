import type { InferInsertModel } from 'drizzle-orm'

import { type GenreOperation } from '$lib/types/genres'

import type { IDrizzleConnection } from './db/connection'
import { GenreHistoryDatabase } from './db/controllers/genre-history'
import type { Genre, genreHistoryAkas } from './db/schema'

export async function createGenreHistoryEntry({
  genre,
  accountId,
  operation,
  connection,
}: {
  genre: Pick<
    Genre,
    'id' | 'name' | 'type' | 'shortDescription' | 'longDescription' | 'notes' | 'subtitle' | 'nsfw'
  > & {
    parents: number[]
    influencedBy: number[]
    akas: Omit<InferInsertModel<typeof genreHistoryAkas>, 'genreId'>[]
  }
  accountId: number
  operation: GenreOperation
  connection: IDrizzleConnection
}) {
  const genreHistoryDb = new GenreHistoryDatabase()
  await genreHistoryDb.insert(
    [
      {
        name: genre.name,
        type: genre.type,
        shortDescription: genre.shortDescription,
        longDescription: genre.longDescription,
        notes: genre.notes,
        parentGenreIds: genre.parents,
        influencedByGenreIds: genre.influencedBy,
        treeGenreId: genre.id,
        nsfw: genre.nsfw,
        operation,
        accountId,
        subtitle: genre.subtitle,
        akas: genre.akas,
      },
    ],
    connection,
  )
}
