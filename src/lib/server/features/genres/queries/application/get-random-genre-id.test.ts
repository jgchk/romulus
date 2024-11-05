import { expect } from 'vitest'

import { type ExtendedInsertGenre, GenresDatabase } from '$lib/server/db/controllers/genre'

import { test } from '../../../../../../vitest-setup'
import { GetRandomGenreIdQuery } from './get-random-genre-id'

function getTestGenre(data?: Partial<ExtendedInsertGenre>): ExtendedInsertGenre {
  return { name: 'Test', akas: [], parents: [], influencedBy: [], updatedAt: new Date(), ...data }
}

test('should return undefined when no genres exist', async ({ dbConnection }) => {
  const query = new GetRandomGenreIdQuery(dbConnection)
  const result = await query.execute()
  expect(result).toBeUndefined()
})

test('should return the only id when only one genre exists', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  const [genre] = await genresDb.insert([getTestGenre()], dbConnection)

  const query = new GetRandomGenreIdQuery(dbConnection)
  const result = await query.execute()
  expect(result).toEqual(genre.id)
})

test('should return a random id when multiple genres exist', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  const [genre1, genre2] = await genresDb.insert([getTestGenre(), getTestGenre()], dbConnection)

  const query = new GetRandomGenreIdQuery(dbConnection)
  const result = await query.execute()
  expect([genre1.id, genre2.id]).toContain(result)
})
