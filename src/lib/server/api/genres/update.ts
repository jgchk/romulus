import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { equals, pick } from 'ramda'
import type { z } from 'zod'

import type { IDrizzleConnection } from '$lib/server/db/connection'
import { GenresDatabase } from '$lib/server/db/controllers/genre'
import { GenreHistoryDatabase } from '$lib/server/db/controllers/genre-history'
import { createGenreHistoryEntry } from '$lib/server/genres'

import type { Account, Genre, genreAkas, genreHistory, genreHistoryAkas } from '../../db/schema'
import { type GenreData, type genreSchema, NotFoundError } from './types'

export class GenreCycleError extends Error {
  constructor(public cycle: string) {
    super(`Cycle detected: ${cycle}`)
  }
}

export class SelfInfluenceError extends Error {
  constructor() {
    super('A genre cannot influence itself')
  }
}

export class NoUpdatesError extends Error {
  constructor() {
    super('No updates were made')
  }
}

export async function updateGenre(
  id: Genre['id'],
  data: GenreData,
  accountId: Account['id'],
  dbConnection: IDrizzleConnection,
): Promise<void> {
  const genresDb = new GenresDatabase()
  const genreHistoryDb = new GenreHistoryDatabase()

  await dbConnection.transaction(async (tx) => {
    const currentGenre = await genresDb.findByIdEdit(id, tx)
    if (!currentGenre) {
      throw new NotFoundError()
    }

    const cycle = await detectCycle({ id, name: data.name, parents: data.parents }, tx)
    if (cycle) {
      throw new GenreCycleError(cycle)
    }

    if (data.influencedBy.includes(id)) {
      throw new SelfInfluenceError()
    }

    const lastHistory = await genreHistoryDb.findLatestByGenreId(id, tx)

    const akas = [
      ...(data.primaryAkas ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map((name, order) => ({ genreId: id, name, relevance: 3, order })),
      ...(data.secondaryAkas ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map((name, order) => ({ genreId: id, name, relevance: 2, order })),
      ...(data.tertiaryAkas ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map((name, order) => ({ genreId: id, name, relevance: 1, order })),
    ]

    if (lastHistory && !didChange({ ...data, akas }, lastHistory)) {
      throw new NoUpdatesError()
    }

    const updatedGenre = await genresDb.update(
      id,
      {
        name: data.name,
        shortDescription: data.shortDescription,
        longDescription: data.longDescription,
        notes: data.notes,
        type: data.type,
        subtitle: data.subtitle,
        nsfw: data.nsfw,
        updatedAt: new Date(),
        akas,
        parents: data.parents,
        influencedBy: data.influencedBy,
      },
      tx,
    )

    await createGenreHistoryEntry({
      genre: updatedGenre,
      accountId,
      operation: 'UPDATE',
      connection: tx,
    })
  })
}

function didChange(
  data: z.infer<typeof genreSchema> & {
    akas: Omit<InferInsertModel<typeof genreAkas>, 'genreId'>[]
  },
  history: InferSelectModel<typeof genreHistory> & {
    akas: Omit<InferSelectModel<typeof genreHistoryAkas>, 'genreId'>[]
  },
) {
  if (data.name !== history.name) return true
  if (data.subtitle !== history.subtitle) return true
  if (data.nsfw !== history.nsfw) return true
  if (data.type !== history.type) return true
  if (data.shortDescription !== history.shortDescription) return true
  if (data.longDescription !== history.longDescription) return true
  if (data.notes !== history.notes) return true
  if (!equals(new Set(data.parents), new Set(history.parentGenreIds))) return true
  if (!equals(new Set(data.influencedBy), new Set(history.influencedByGenreIds))) return true
  if (
    !equals(
      data.akas.map((aka) => pick(['name', 'relevance', 'order'], aka)),
      history.akas.map((aka) => pick(['name', 'relevance', 'order'], aka)),
    )
  )
    return true
  return false
}

type CycleGenre = { id: number; name: string; parents: number[] }

async function detectCycle(
  data: {
    id?: number
    name: string
    parents?: number[]
    children?: number[]
  },
  connection: IDrizzleConnection,
) {
  const genresDb = new GenresDatabase()

  let allGenres = await genresDb.findAllSimple(connection)

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
