import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { equals, pick } from 'ramda'
import type { z } from 'zod'

import { type IGenresDatabase } from '$lib/server/db/controllers/genre'
import { type IGenreHistoryDatabase } from '$lib/server/db/controllers/genre-history'
import type { ITransactor } from '$lib/server/db/transactor'
import { createGenreHistoryEntry, detectCycle, GenreCycleError } from '$lib/server/genres'

import type { Account, Genre, genreAkas, genreHistory, genreHistoryAkas } from '../../db/schema'
import { type GenreData, type genreSchema, NotFoundError } from './types'

export type UpdateGenreContext<T> = {
  transactor: ITransactor<T>
  genresDb: IGenresDatabase<T>
  genreHistoryDb: IGenreHistoryDatabase<T>
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

export async function updateGenre<T>(
  id: Genre['id'],
  data: GenreData,
  accountId: Account['id'],
  { transactor, genresDb, genreHistoryDb }: UpdateGenreContext<T>,
): Promise<void> {
  await transactor.transaction(async (tx) => {
    const currentGenre = await genresDb.findByIdEdit(id, tx)
    if (!currentGenre) {
      throw new NotFoundError()
    }

    const cycle = await detectCycle({ id, name: data.name, parents: data.parents }, genresDb, tx)
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
      genreHistoryDb,
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
