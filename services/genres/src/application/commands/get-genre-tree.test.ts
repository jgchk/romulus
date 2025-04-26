import { expect } from 'vitest'

import type { IDrizzleConnection } from '../../infrastructure/drizzle-database.js'
import { DrizzleGenreHistoryRepository } from '../../infrastructure/drizzle-genre-history-repository.js'
import { DrizzleGenreRepository } from '../../infrastructure/drizzle-genre-repository.js'
import { DrizzleGenreTreeRepository } from '../../infrastructure/drizzle-genre-tree-repository.js'
import { MockAuthorizationService } from '../../test/mock-authorization-service.js'
import { test } from '../../vitest-setup.js'
import type { CreateGenreInput } from './create-genre.js'
import { CreateGenreCommand } from './create-genre.js'
import { GetGenreTreeQuery } from './get-genre-tree.js'

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

test('should return an empty array when there are no genres', async ({ dbConnection }) => {
  const query = new GetGenreTreeQuery(dbConnection)
  const result = await query.execute()

  expect(result).toEqual([])
})

test('should return genre data with empty relationships when a single genre exists', async ({
  dbConnection,
}) => {
  const accountId = 1
  const genre = await createGenre(getTestGenre({ name: 'Rock' }), accountId, dbConnection)

  const query = new GetGenreTreeQuery(dbConnection)
  const result = await query.execute()

  expect(result).toEqual([
    {
      id: genre.id,
      name: 'Rock',
      subtitle: null,
      type: 'STYLE',
      akas: [],
      children: [],
      derivedFrom: [],
      derivations: [],
      relevance: 99, // Default relevance value
      nsfw: false,
      updatedAt: expect.any(Date) as Date,
    },
  ])
})

test('should correctly include aka values', async ({ dbConnection }) => {
  const accountId = 1
  const genre = await createGenre(
    getTestGenre({
      name: 'Rock',
      akas: {
        primary: ['rock music', 'rock n roll'],
        secondary: ['rock and roll'],
        tertiary: ['rockmusic'],
      },
    }),
    accountId,
    dbConnection,
  )

  const query = new GetGenreTreeQuery(dbConnection)
  const result = await query.execute()

  const genreResult = result.find((g) => g.id === genre.id)
  expect(genreResult).toBeDefined()
  expect(genreResult?.akas).toEqual(['rock music', 'rock n roll', 'rock and roll', 'rockmusic'])
})

test('should correctly establish parent-child relationships', async ({ dbConnection }) => {
  const accountId = 1
  const parent = await createGenre(getTestGenre({ name: 'Music' }), accountId, dbConnection)
  const child = await createGenre(
    getTestGenre({ name: 'Rock', parents: new Set([parent.id]) }),
    accountId,
    dbConnection,
  )

  const query = new GetGenreTreeQuery(dbConnection)
  const result = await query.execute()

  // Find parent and child in results
  const parentResult = result.find((g) => g.id === parent.id)
  const childResult = result.find((g) => g.id === child.id)

  expect(parentResult).toBeDefined()
  expect(childResult).toBeDefined()

  // Parent should have child in its children array
  expect(parentResult?.children).toContain(child.id)

  // Child should not have any children
  expect(childResult?.children).toEqual([])
})

test('should correctly establish derivation relationships', async ({ dbConnection }) => {
  const accountId = 1
  const original = await createGenre(getTestGenre({ name: 'Blues' }), accountId, dbConnection)
  const derivation = await createGenre(
    getTestGenre({ name: 'Rock', derivedFrom: new Set([original.id]) }),
    accountId,
    dbConnection,
  )

  const query = new GetGenreTreeQuery(dbConnection)
  const result = await query.execute()

  // Find original and derivation in results
  const originalResult = result.find((g) => g.id === original.id)
  const derivationResult = result.find((g) => g.id === derivation.id)

  expect(originalResult).toBeDefined()
  expect(derivationResult).toBeDefined()

  // Original should have derivation in its derivations array
  expect(originalResult?.derivations).toContain(derivation.id)

  // Derivation should have original in its derivedFrom array
  expect(derivationResult?.derivedFrom).toContain(original.id)
})

test('should correctly handle complex relationships', async ({ dbConnection }) => {
  const accountId = 1

  // Create a more complex set of genre relationships
  const music = await createGenre(getTestGenre({ name: 'Music' }), accountId, dbConnection)
  const blues = await createGenre(
    getTestGenre({ name: 'Blues', parents: new Set([music.id]) }),
    accountId,
    dbConnection,
  )
  const rock = await createGenre(
    getTestGenre({ name: 'Rock', parents: new Set([music.id]) }),
    accountId,
    dbConnection,
  )
  const hardRock = await createGenre(
    getTestGenre({ name: 'Hard Rock', parents: new Set([rock.id]) }),
    accountId,
    dbConnection,
  )
  const metal = await createGenre(
    getTestGenre({ name: 'Metal', derivedFrom: new Set([hardRock.id]) }),
    accountId,
    dbConnection,
  )

  const query = new GetGenreTreeQuery(dbConnection)
  const result = await query.execute()

  // Find all genres in results
  const musicResult = result.find((g) => g.id === music.id)
  const bluesResult = result.find((g) => g.id === blues.id)
  const rockResult = result.find((g) => g.id === rock.id)
  const hardRockResult = result.find((g) => g.id === hardRock.id)
  const metalResult = result.find((g) => g.id === metal.id)

  expect(musicResult).toBeDefined()
  expect(bluesResult).toBeDefined()
  expect(rockResult).toBeDefined()
  expect(hardRockResult).toBeDefined()
  expect(metalResult).toBeDefined()

  // Verify parent-child relationships
  expect(musicResult?.children).toContain(blues.id)
  expect(musicResult?.children).toContain(rock.id)
  expect(rockResult?.children).toContain(hardRock.id)

  // Verify derivation relationships
  expect(hardRockResult?.derivations).toContain(metal.id)
  expect(metalResult?.derivedFrom).toContain(hardRock.id)
})

test('should sort relationship arrays alphabetically by name', async ({ dbConnection }) => {
  const accountId = 1

  // Create genres with alphabetically unordered names
  const jazz = await createGenre(getTestGenre({ name: 'Jazz' }), accountId, dbConnection)
  const blues = await createGenre(getTestGenre({ name: 'Blues' }), accountId, dbConnection)
  const rock = await createGenre(getTestGenre({ name: 'Rock' }), accountId, dbConnection)

  // Create genres with parent relationships
  const jazzFusion = await createGenre(
    getTestGenre({
      name: 'Jazz Fusion',
      parents: new Set([jazz.id, rock.id]),
    }),
    accountId,
    dbConnection,
  )

  // Create genres with derivation relationships
  const bluesRock = await createGenre(
    getTestGenre({
      name: 'Blues Rock',
      derivedFrom: new Set([blues.id, rock.id]),
    }),
    accountId,
    dbConnection,
  )

  const query = new GetGenreTreeQuery(dbConnection)
  const result = await query.execute()

  // Find results in the response
  const jazzFusionResult = result.find((g) => g.id === jazzFusion.id)
  const bluesRockResult = result.find((g) => g.id === bluesRock.id)
  expect(jazzFusionResult).toBeDefined()
  expect(bluesRockResult).toBeDefined()

  // Get the original genre records
  const jazzResult = result.find((g) => g.id === jazz.id)
  const bluesResult = result.find((g) => g.id === blues.id)
  const rockResult = result.find((g) => g.id === rock.id)

  // The sorting is done by name, so we need to compare the actual ordering in the arrays
  // The expected ordering should be Blues, Jazz, Rock (alphabetical)
  expect(bluesRockResult?.derivedFrom).toEqual([blues.id, rock.id])

  // Similarly check the parent-child relationships from other side
  expect(jazzResult?.children).toContain(jazzFusion.id)
  expect(rockResult?.children).toContain(jazzFusion.id)

  // Check the derivation relationships from the other side
  expect(bluesResult?.derivations).toContain(bluesRock.id)
  expect(rockResult?.derivations).toContain(bluesRock.id)
})
