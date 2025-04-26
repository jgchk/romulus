import { expect } from 'vitest'

import type { IDrizzleConnection } from '../../infrastructure/drizzle-database.js'
import { DrizzleGenreHistoryRepository } from '../../infrastructure/drizzle-genre-history-repository.js'
import { DrizzleGenreRepository } from '../../infrastructure/drizzle-genre-repository.js'
import { DrizzleGenreTreeRepository } from '../../infrastructure/drizzle-genre-tree-repository.js'
import { MockAuthorizationService } from '../../test/mock-authorization-service.js'
import { test } from '../../vitest-setup.js'
import type { CreateGenreInput } from './create-genre.js'
import { CreateGenreCommand } from './create-genre.js'
import { GetRandomGenreIdQuery } from './get-random-genre-id.js'

async function createGenre(
  data: CreateGenreInput,
  accountId: number,
  dbConnection: IDrizzleConnection,
) {
  const createGenreCommand = new CreateGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreTreeRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
    new MockAuthorizationService(),
  )

  const genre = await createGenreCommand.execute(data, accountId)

  if (genre.isErr()) {
    expect.fail(`Failed to create genre: ${genre.error.message}`)
  }

  return genre.value
}

function getTestGenre(data?: Partial<CreateGenreInput>): CreateGenreInput {
  return {
    name: 'Test',
    type: 'STYLE',
    nsfw: false,
    parents: new Set(),
    derivedFrom: new Set(),
    influences: new Set(),
    akas: {
      primary: [],
      secondary: [],
      tertiary: [],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...data,
  }
}

test('should return undefined when no genres exist', async ({ dbConnection }) => {
  const query = new GetRandomGenreIdQuery(dbConnection)
  const result = await query.execute()
  expect(result).toBeUndefined()
})

test('should return the only id when only one genre exists', async ({ dbConnection }) => {
  const genre = await createGenre(getTestGenre(), 1, dbConnection)

  const query = new GetRandomGenreIdQuery(dbConnection)
  const result = await query.execute()
  expect(result).toEqual(genre.id)
})

test('should return a random id when multiple genres exist', async ({ dbConnection }) => {
  const accountId = 1

  const genre1 = await createGenre(getTestGenre(), accountId, dbConnection)
  const genre2 = await createGenre(getTestGenre(), accountId, dbConnection)

  const query = new GetRandomGenreIdQuery(dbConnection)
  const result = await query.execute()
  expect([genre1.id, genre2.id]).toContain(result)
})
