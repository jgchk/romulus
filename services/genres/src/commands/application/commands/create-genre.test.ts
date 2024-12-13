import { expect } from 'vitest'

import { GetGenreQuery } from '../../../queries/application/get-genre'
import { GetGenreHistoryQuery } from '../../../queries/application/get-genre-history'
import type { IDrizzleConnection } from '../../../shared/infrastructure/drizzle-database'
import { MockAuthorizationApplication } from '../../../test/mock-authorization-application'
import { test } from '../../../vitest-setup'
import { DrizzleGenreHistoryRepository } from '../../infrastructure/drizzle-genre-history-repository'
import { DrizzleGenreRepository } from '../../infrastructure/drizzle-genre-repository'
import { DrizzleGenreTreeRepository } from '../../infrastructure/drizzle-genre-tree-repository'
import { CreateGenreCommand, type CreateGenreInput } from './create-genre'

function setup(dbConnection: IDrizzleConnection) {
  const createGenreCommand = new CreateGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreTreeRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
    new MockAuthorizationApplication(),
  )

  return createGenreCommand
}

test('should return the created genre id', async ({ dbConnection }) => {
  const genreData: CreateGenreInput = {
    name: 'Test',
    subtitle: undefined,
    type: 'STYLE',
    shortDescription: undefined,
    longDescription: undefined,
    notes: undefined,
    akas: {
      primary: [],
      secondary: [],
      tertiary: [],
    },
    parents: new Set([]),
    derivedFrom: new Set([]),
    influences: new Set([]),
    nsfw: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const createGenreCommand = setup(dbConnection)

  const result = await createGenreCommand.execute(genreData, 1)

  if (result instanceof Error) {
    expect.fail(`CreateGenreCommand errored: ${result.message}`)
  }

  expect(result.id).toBeTypeOf('number')
})

test('should insert the genre into the database', async ({ dbConnection }) => {
  const genreData: CreateGenreInput = {
    name: 'Test',
    subtitle: undefined,
    type: 'STYLE',
    shortDescription: undefined,
    longDescription: undefined,
    notes: undefined,
    akas: {
      primary: [],
      secondary: [],
      tertiary: [],
    },
    parents: new Set([]),
    derivedFrom: new Set([]),
    influences: new Set([]),
    nsfw: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const createGenreCommand = setup(dbConnection)

  const accountId = 1
  const result = await createGenreCommand.execute(genreData, accountId)

  if (result instanceof Error) {
    expect.fail(`CreateGenreCommand errored: ${result.message}`)
  }

  const getGenreQuery = new GetGenreQuery(dbConnection)
  const genre = await getGenreQuery.execute(result.id)
  expect(genre).toEqual({
    id: expect.any(Number) as number,
    name: 'Test',
    subtitle: null,
    type: 'STYLE',
    shortDescription: null,
    longDescription: null,
    notes: null,
    parents: [],
    children: [],
    derivedFrom: [],
    influencedBy: [],
    influences: [],
    relevance: 99,
    nsfw: false,
    akas: {
      primary: [],
      secondary: [],
      tertiary: [],
    },
    createdAt: expect.any(Date) as Date,
    updatedAt: expect.any(Date) as Date,
    contributors: [accountId],
  })
})

test('should map AKAs correctly', async ({ dbConnection }) => {
  const genreData: CreateGenreInput = {
    name: 'Test',
    subtitle: undefined,
    type: 'STYLE',
    shortDescription: undefined,
    longDescription: undefined,
    notes: undefined,
    akas: {
      primary: ['primary one', 'primary two'],
      secondary: ['secondary one', 'secondary two'],
      tertiary: ['tertiary one', 'tertiary two'],
    },
    parents: new Set([]),
    derivedFrom: new Set([]),
    influences: new Set([]),
    nsfw: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const createGenreCommand = setup(dbConnection)

  const result = await createGenreCommand.execute(genreData, 1)

  if (result instanceof Error) {
    expect.fail(`CreateGenreCommand errored: ${result.message}`)
  }

  const getGenreQuery = new GetGenreQuery(dbConnection)
  const genre = await getGenreQuery.execute(result.id)
  expect(genre?.akas).toEqual({
    primary: ['primary one', 'primary two'],
    secondary: ['secondary one', 'secondary two'],
    tertiary: ['tertiary one', 'tertiary two'],
  })
})

test('should insert a history entry', async ({ dbConnection }) => {
  const pastDate = new Date('2000-01-01')
  const genreData: CreateGenreInput = {
    name: 'Test',
    subtitle: undefined,
    type: 'STYLE',
    shortDescription: undefined,
    longDescription: undefined,
    notes: undefined,
    akas: {
      primary: [],
      secondary: [],
      tertiary: [],
    },
    parents: new Set([]),
    derivedFrom: new Set([]),
    influences: new Set([]),
    nsfw: false,
    createdAt: pastDate,
    updatedAt: pastDate,
  }

  const accountId = 1

  const beforeExecute = new Date()
  const createGenreCommand = setup(dbConnection)
  const result = await createGenreCommand.execute(genreData, accountId)
  const afterExecute = new Date()

  if (result instanceof Error) {
    expect.fail(`CreateGenreCommand errored: ${result.message}`)
  }

  const getGenreHistoryQuery = new GetGenreHistoryQuery(dbConnection)
  const genreHistory = await getGenreHistoryQuery.execute(result.id)
  expect(genreHistory).toEqual([
    {
      id: expect.any(Number) as number,
      treeGenreId: result.id,
      name: 'Test',
      subtitle: null,
      type: 'STYLE',
      shortDescription: null,
      longDescription: null,
      notes: null,
      akas: [],
      parentGenreIds: [],
      derivedFromGenreIds: [],
      influencedByGenreIds: [],
      nsfw: false,
      accountId,
      operation: 'CREATE',
      createdAt: expect.any(Date) as Date,
    },
  ])

  expect(genreHistory[0].createdAt.getTime()).toBeGreaterThanOrEqual(beforeExecute.getTime())
  expect(genreHistory[0].createdAt.getTime()).toBeLessThanOrEqual(afterExecute.getTime())
  expect(genreHistory[0].createdAt).not.toEqual(pastDate)
})
