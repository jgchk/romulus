import { expect } from 'vitest'

import type { IDrizzleConnection } from '../../infrastructure/drizzle-database'
import { DrizzleGenreHistoryRepository } from '../../infrastructure/drizzle-genre-history-repository'
import { DrizzleGenreRepository } from '../../infrastructure/drizzle-genre-repository'
import { DrizzleGenreTreeRepository } from '../../infrastructure/drizzle-genre-tree-repository'
import { MockAuthorizationService } from '../../test/mock-authorization-service'
import { test } from '../../vitest-setup'
import { CreateGenreCommand, type CreateGenreInput } from './create-genre'
import { GetLatestGenreUpdatesQuery } from './get-latest-genre-updates'
import { UpdateGenreCommand } from './update-genre'

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

test('should return latest history for a created genre', async ({ dbConnection }) => {
  const accountId = 1

  const genre = await createGenre(
    getTestGenre({
      akas: {
        primary: ['primary', 'primary-2'],
        secondary: ['secondary', 'secondary-2'],
        tertiary: ['tertiary', 'tertiary-2'],
      },
    }),
    accountId,
    dbConnection,
  )

  const query = new GetLatestGenreUpdatesQuery(dbConnection)
  const result = await query.execute()
  expect(result).toEqual([
    {
      genre: {
        id: expect.any(Number) as number,
        name: 'Test',
        subtitle: null,
        akas: {
          primary: ['primary', 'primary-2'],
          secondary: ['secondary', 'secondary-2'],
          tertiary: ['tertiary', 'tertiary-2'],
        },
        type: 'STYLE',
        nsfw: false,
        shortDescription: null,
        longDescription: null,
        notes: null,
        parentGenreIds: [],
        derivedFromGenreIds: [],
        influencedByGenreIds: [],
        treeGenreId: genre.id,
        createdAt: expect.any(Date) as Date,
        operation: 'CREATE',
        accountId,
      },
      previousHistory: undefined,
    },
  ])
})

test('should return latest history for an updated genre', async ({ dbConnection }) => {
  const accountId = 1

  const genre = await createGenre(
    getTestGenre({
      akas: {
        primary: ['primary', 'primary-2'],
        secondary: ['secondary', 'secondary-2'],
        tertiary: ['tertiary', 'tertiary-2'],
      },
    }),
    accountId,
    dbConnection,
  )

  const updateGenreCommand = new UpdateGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreTreeRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
    new MockAuthorizationService(),
  )
  const updateResult = await updateGenreCommand.execute(
    genre.id,
    {
      name: 'Updated',
      akas: {
        primary: ['primary-updated', 'primary-2-updated'],
        secondary: ['secondary-updated', 'secondary-2-updated'],
        tertiary: ['tertiary-updated', 'tertiary-2-updated'],
      },
    },
    accountId,
  )
  if (updateResult instanceof Error) {
    expect.fail(`Failed to update genre: ${updateResult.message}`)
  }

  const query = new GetLatestGenreUpdatesQuery(dbConnection)
  const result = await query.execute()

  expect(result).toEqual([
    {
      genre: {
        id: expect.any(Number) as number,
        name: 'Updated',
        subtitle: null,
        akas: {
          primary: ['primary-updated', 'primary-2-updated'],
          secondary: ['secondary-updated', 'secondary-2-updated'],
          tertiary: ['tertiary-updated', 'tertiary-2-updated'],
        },
        type: 'STYLE',
        shortDescription: null,
        longDescription: null,
        nsfw: false,
        notes: null,
        parentGenreIds: [],
        derivedFromGenreIds: [],
        influencedByGenreIds: [],
        treeGenreId: genre.id,
        createdAt: expect.any(Date) as Date,
        operation: 'UPDATE',
        accountId,
      },
      previousHistory: {
        name: 'Test',
        subtitle: null,
        akas: {
          primary: ['primary', 'primary-2'],
          secondary: ['secondary', 'secondary-2'],
          tertiary: ['tertiary', 'tertiary-2'],
        },
        type: 'STYLE',
        shortDescription: null,
        longDescription: null,
        nsfw: false,
        notes: null,
        parentGenreIds: [],
        derivedFromGenreIds: [],
        influencedByGenreIds: [],
        treeGenreId: genre.id,
        createdAt: expect.any(Date) as Date,
        operation: 'CREATE',
      },
    },
    {
      genre: {
        id: expect.any(Number) as number,
        name: 'Test',
        subtitle: null,
        akas: {
          primary: ['primary', 'primary-2'],
          secondary: ['secondary', 'secondary-2'],
          tertiary: ['tertiary', 'tertiary-2'],
        },
        type: 'STYLE',
        shortDescription: null,
        longDescription: null,
        nsfw: false,
        notes: null,
        parentGenreIds: [],
        derivedFromGenreIds: [],
        influencedByGenreIds: [],
        treeGenreId: genre.id,
        createdAt: expect.any(Date) as Date,
        operation: 'CREATE',
        accountId,
      },
      previousHistory: undefined,
    },
  ])
})
