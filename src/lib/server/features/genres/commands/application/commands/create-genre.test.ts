import { expect } from 'vitest'

import type { IDrizzleConnection } from '$lib/server/db/connection'
import { AccountsDatabase } from '$lib/server/db/controllers/accounts'
import { UNSET_GENRE_RELEVANCE } from '$lib/types/genres'

import { test } from '../../../../../../../vitest-setup'
import { GetGenreQuery } from '../../../queries/application/get-genre'
import { GetGenreHistoryQuery } from '../../../queries/application/get-genre-history'
import { GetGenreRelevanceVoteByAccountQuery } from '../../../queries/application/get-genre-relevance-vote-by-account'
import { DrizzleGenreRelevanceVoteRepository } from '../../infrastructure/drizzle-genre-relevance-vote-repository'
import { DrizzleGenreRepository } from '../../infrastructure/genre/drizzle-genre-repository'
import { DrizzleGenreHistoryRepository } from '../../infrastructure/genre-history/drizzle-genre-history-repository'
import { CreateGenreCommand, type CreateGenreInput } from './create-genre'
import { VoteGenreRelevanceCommand } from './vote-genre-relevance'

function setup(dbConnection: IDrizzleConnection) {
  const createGenreCommand = new CreateGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
    new VoteGenreRelevanceCommand(new DrizzleGenreRelevanceVoteRepository(dbConnection)),
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
    relevance: UNSET_GENRE_RELEVANCE,
    nsfw: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert(
    [
      {
        username: 'test-1',
        password: 'test-1',
      },
    ],
    dbConnection,
  )

  const createGenreCommand = setup(dbConnection)

  const result = await createGenreCommand.execute(genreData, account.id)

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
    relevance: UNSET_GENRE_RELEVANCE,
    nsfw: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert(
    [
      {
        username: 'test-2',
        password: 'test-2',
      },
    ],
    dbConnection,
  )

  const createGenreCommand = setup(dbConnection)

  const result = await createGenreCommand.execute(genreData, account.id)

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
    contributors: [
      {
        id: account.id,
        username: account.username,
      },
    ],
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
    relevance: UNSET_GENRE_RELEVANCE,
    nsfw: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert(
    [
      {
        username: 'test-3',
        password: 'test-3',
      },
    ],
    dbConnection,
  )

  const createGenreCommand = setup(dbConnection)

  const result = await createGenreCommand.execute(genreData, account.id)

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
    relevance: UNSET_GENRE_RELEVANCE,
    nsfw: false,
    createdAt: pastDate,
    updatedAt: pastDate,
  }

  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert(
    [
      {
        username: 'test-3',
        password: 'test-3',
      },
    ],
    dbConnection,
  )

  const beforeExecute = new Date()
  const createGenreCommand = setup(dbConnection)
  const result = await createGenreCommand.execute(genreData, account.id)
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
      accountId: account.id,
      operation: 'CREATE',
      createdAt: expect.any(Date) as Date,
      account: {
        id: account.id,
        username: 'test-3',
      },
    },
  ])

  expect(genreHistory[0].createdAt.getTime()).toBeGreaterThanOrEqual(beforeExecute.getTime())
  expect(genreHistory[0].createdAt.getTime()).toBeLessThanOrEqual(afterExecute.getTime())
  expect(genreHistory[0].createdAt).not.toEqual(pastDate)
})

test('should insert a relevance vote when relevance is set', async ({ dbConnection }) => {
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
    relevance: 1,
    nsfw: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert(
    [
      {
        username: 'test-3',
        password: 'test-3',
      },
    ],
    dbConnection,
  )

  const createGenreCommand = setup(dbConnection)

  const result = await createGenreCommand.execute(genreData, account.id)

  if (result instanceof Error) {
    expect.fail(`CreateGenreCommand errored: ${result.message}`)
  }

  const getGenreRelevanceVoteByAccountQuery = new GetGenreRelevanceVoteByAccountQuery(dbConnection)
  const genreRelevanceVote = await getGenreRelevanceVoteByAccountQuery.execute(
    result.id,
    account.id,
  )
  expect(genreRelevanceVote).toEqual({
    genreId: result.id,
    accountId: account.id,
    relevance: 1,
    createdAt: expect.any(Date) as Date,
    updatedAt: expect.any(Date) as Date,
  })

  const getGenreQuery = new GetGenreQuery(dbConnection)
  const genre = await getGenreQuery.execute(result.id)
  expect(genre?.relevance).toBe(1)
})

test('should not insert a relevance vote when relevance is unset', async ({ dbConnection }) => {
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
    relevance: UNSET_GENRE_RELEVANCE,
    nsfw: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert(
    [
      {
        username: 'test-3',
        password: 'test-3',
      },
    ],
    dbConnection,
  )

  const createGenreCommand = setup(dbConnection)

  const result = await createGenreCommand.execute(genreData, account.id)

  if (result instanceof Error) {
    expect.fail(`CreateGenreCommand errored: ${result.message}`)
  }

  const getGenreRelevanceVoteByAccountQuery = new GetGenreRelevanceVoteByAccountQuery(dbConnection)
  const genreRelevanceVote = await getGenreRelevanceVoteByAccountQuery.execute(
    result.id,
    account.id,
  )
  expect(genreRelevanceVote).toBeUndefined()

  const getGenreQuery = new GetGenreQuery(dbConnection)
  const genre = await getGenreQuery.execute(result.id)
  expect(genre?.relevance).toBe(99)
})
