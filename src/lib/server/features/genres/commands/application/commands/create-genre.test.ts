import { expect } from 'vitest'

import type { IDrizzleConnection } from '$lib/server/db/connection'
import { AccountsDatabase } from '$lib/server/db/controllers/accounts'
import { GenresDatabase } from '$lib/server/db/controllers/genre'
import { GenreHistoryDatabase } from '$lib/server/db/controllers/genre-history'
import { GenreRelevanceVotesDatabase } from '$lib/server/db/controllers/genre-relevance-votes'
import { UNSET_GENRE_RELEVANCE } from '$lib/types/genres'

import { test } from '../../../../../../../vitest-setup'
import type { GenreConstructorParams } from '../../domain/genre'
import { DrizzleGenreRelevanceVoteRepository } from '../../infrastructure/drizzle-genre-relevance-vote-repository'
import { DrizzleGenreRepository } from '../../infrastructure/genre/drizzle-genre-repository'
import { DrizzleGenreHistoryRepository } from '../../infrastructure/genre-history/drizzle-genre-history-repository'
import { CreateGenreCommand } from './create-genre'
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
  const genreData: GenreConstructorParams = {
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

  const { id } = await createGenreCommand.execute(genreData, account.id)

  expect(id).toBeTypeOf('number')
})

test('should insert the genre into the database', async ({ dbConnection }) => {
  const genreData: GenreConstructorParams = {
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

  const { id } = await createGenreCommand.execute(genreData, account.id)

  const genresDb = new GenresDatabase()
  const genre = await genresDb.findByIdEdit(id, dbConnection)
  expect(genre).toEqual({
    id: expect.any(Number) as number,
    name: 'Test',
    subtitle: null,
    type: 'STYLE',
    shortDescription: null,
    longDescription: null,
    notes: null,
    parents: [],
    influencedBy: [],
    relevance: 99,
    nsfw: false,
    akas: [],
    createdAt: expect.any(Date) as Date,
    updatedAt: expect.any(Date) as Date,
  })
})

test('should map AKAs correctly', async ({ dbConnection }) => {
  const genreData: GenreConstructorParams = {
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

  const { id } = await createGenreCommand.execute(genreData, account.id)

  const genresDb = new GenresDatabase()
  const genre = await genresDb.findByIdEdit(id, dbConnection)
  expect(genre).toEqual({
    id: expect.any(Number) as number,
    name: 'Test',
    subtitle: null,
    type: 'STYLE',
    shortDescription: null,
    longDescription: null,
    notes: null,
    parents: [],
    influencedBy: [],
    relevance: 99,
    nsfw: false,
    akas: [
      { name: 'primary one', relevance: 3, order: 0 },
      { name: 'primary two', relevance: 3, order: 1 },
      { name: 'secondary one', relevance: 2, order: 0 },
      { name: 'secondary two', relevance: 2, order: 1 },
      { name: 'tertiary one', relevance: 1, order: 0 },
      { name: 'tertiary two', relevance: 1, order: 1 },
    ],
    createdAt: expect.any(Date) as Date,
    updatedAt: expect.any(Date) as Date,
  })
})

test('should insert a history entry', async ({ dbConnection }) => {
  const pastDate = new Date('2000-01-01')
  const genreData: GenreConstructorParams = {
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
  const { id } = await createGenreCommand.execute(genreData, account.id)
  const afterExecute = new Date()

  const genreHistoryDb = new GenreHistoryDatabase()
  const genreHistory = await genreHistoryDb.findByGenreId(id, dbConnection)
  expect(genreHistory).toEqual([
    {
      id: expect.any(Number) as number,
      treeGenreId: id,
      name: 'Test',
      subtitle: null,
      type: 'STYLE',
      shortDescription: null,
      longDescription: null,
      notes: null,
      akas: [],
      parentGenreIds: [],
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
  const genreData: GenreConstructorParams = {
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

  const { id } = await createGenreCommand.execute(genreData, account.id)

  const genreRelevanceVotesDb = new GenreRelevanceVotesDatabase()
  const genreRelevanceVote = await genreRelevanceVotesDb.findByGenreIdAndAccountId(
    id,
    account.id,
    dbConnection,
  )
  expect(genreRelevanceVote).toEqual({
    genreId: id,
    accountId: account.id,
    relevance: 1,
    createdAt: expect.any(Date) as Date,
    updatedAt: expect.any(Date) as Date,
  })

  const genresDb = new GenresDatabase()
  const genre = await genresDb.findByIdEdit(id, dbConnection)
  expect(genre?.relevance).toBe(1)
})

test('should not insert a relevance vote when relevance is unset', async ({ dbConnection }) => {
  const genreData: GenreConstructorParams = {
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

  const { id } = await createGenreCommand.execute(genreData, account.id)

  const genreRelevanceVotesDb = new GenreRelevanceVotesDatabase()
  const genreRelevanceVote = await genreRelevanceVotesDb.findByGenreIdAndAccountId(
    id,
    account.id,
    dbConnection,
  )
  expect(genreRelevanceVote).toBeUndefined()

  const genresDb = new GenresDatabase()
  const genre = await genresDb.findByIdEdit(id, dbConnection)
  expect(genre?.relevance).toBe(99)
})
