import type { ExtractTablesWithRelations, InferSelectModel } from 'drizzle-orm'
import type { PgTransaction } from 'drizzle-orm/pg-core'
import type { PostgresJsDatabase, PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js'

import type { GenreOperation } from '$lib/types/genres'

import { db } from '.'
import { genreHistory, genreHistoryAkas, type genres } from './schema'
import * as schema from './schema'

export async function createGenreHistoryEntry({
  genre,
  accountId,
  operation,
  db: db_ = db,
}: {
  genre: Pick<
    InferSelectModel<typeof genres>,
    'id' | 'name' | 'type' | 'shortDescription' | 'longDescription' | 'notes' | 'subtitle'
  > & {
    parents: { parentId: number }[]
    influencedBy: { influencerId: number }[]
    akas: { name: string; relevance: number; order: number }[]
  }
  accountId: number
  operation: GenreOperation
  db?:
    | PostgresJsDatabase<typeof schema>
    | PgTransaction<
        PostgresJsQueryResultHKT,
        typeof schema,
        ExtractTablesWithRelations<typeof schema>
      >
}) {
  const [historyEntry] = await db_
    .insert(genreHistory)
    .values({
      name: genre.name,
      type: genre.type,
      shortDescription: genre.shortDescription,
      longDescription: genre.longDescription,
      notes: genre.notes,
      parentGenreIds: genre.parents.map((parent) => parent.parentId),
      influencedByGenreIds: genre.influencedBy.map((influencer) => influencer.influencerId),
      treeGenreId: genre.id,
      operation,
      accountId,
      subtitle: genre.subtitle,
    })
    .returning()

  if (genre.akas.length > 0) {
    await db_
      .insert(genreHistoryAkas)
      .values(genre.akas.map((aka) => ({ ...aka, genreId: historyEntry.id })))
  }
}
