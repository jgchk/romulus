import type { InferInsertModel } from 'drizzle-orm'

import { type GenreOperation } from '$lib/types/genres'

import type { IGenreHistoryDatabase } from './db/controllers/genre-history'
import type { Genre, genreHistoryAkas } from './db/schema'

export async function createGenreHistoryEntry<T>({
  genre,
  accountId,
  operation,
  genreHistoryDb,
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
  genreHistoryDb: IGenreHistoryDatabase<T>
  connection: T
}) {
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
