import type { ExtractTablesWithRelations, InferSelectModel } from 'drizzle-orm'
import type { PgTransaction } from 'drizzle-orm/pg-core'
import type { PostgresJsDatabase, PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js'
import { z } from 'zod'

import { GENRE_TYPES, type GenreOperation, genreRelevance } from '$lib/types/genres'
import { nullableString } from '$lib/utils/validators'

import { db } from '.'
import { genreHistory, genreHistoryAkas, type genres } from './schema'
import * as schema from './schema'

export const genreSchema = z.object({
  name: z.string().min(1),
  shortDescription: nullableString,
  longDescription: nullableString,
  notes: nullableString,
  type: z.enum(GENRE_TYPES),
  subtitle: nullableString,

  primaryAkas: nullableString,
  secondaryAkas: nullableString,
  tertiaryAkas: nullableString,

  parents: z.number().int().array(),
  influencedBy: z.number().int().array(),

  relevance: genreRelevance.optional(),
})

export type GenreSchema = typeof genreSchema
export type GenreData = z.infer<typeof genreSchema>

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

type CycleGenre = { id: number; name: string; parents: number[] }

export async function detectCycle(data: {
  id?: number
  name: string
  parents?: number[]
  children?: number[]
}) {
  let allGenres = await db.query.genres
    .findMany({
      columns: {
        id: true,
        name: true,
      },
      with: {
        parents: {
          columns: { parentId: true },
        },
      },
    })
    .then((genres) =>
      genres.map((genre) => ({
        ...genre,
        parents: genre.parents.map((parent) => parent.parentId),
      })),
    )

  // if the user has made any updates to parent/child genres,
  // temporarily apply those updates before checking for cycles
  const id = data.id ?? -1
  if (!allGenres.some((genre) => genre.id === id)) {
    allGenres.push({
      id,
      name: data.name,
      parents: data.parents ?? [],
    })
  }

  if (data.parents) {
    const parents = data.parents
    allGenres = allGenres.map((genre) => (genre.id === data.id ? { ...genre, parents } : genre))
  }
  if (data.children) {
    const children = data.children
    allGenres = allGenres.map((genre) =>
      children.includes(genre.id) ? { ...genre, parentGenres: [...genre.parents, id] } : genre,
    )
  }

  const allGenresMap = new Map(allGenres.map((genre) => [genre.id, genre]))

  for (const genre of allGenres) {
    const cycle = detectCycleInner(genre.id, [], allGenresMap)
    if (cycle) {
      const formattedCycle = cycle.map((id) => allGenresMap.get(id)!.name).join(' → ')
      return formattedCycle
    }
  }
}

function detectCycleInner(
  id: number,
  stack: number[],
  allGenresMap: Map<number, CycleGenre>,
): number[] | false {
  if (stack.includes(id)) {
    return [...stack, id]
  }

  const genre = allGenresMap.get(id)
  if (!genre) return false

  for (const parentId of genre.parents) {
    const cycle = detectCycleInner(parentId, [...stack, id], allGenresMap)
    if (cycle) {
      return cycle
    }
  }

  return false
}
