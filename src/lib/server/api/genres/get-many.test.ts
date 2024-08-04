import { expect } from 'vitest'

import { AccountsDatabase } from '$lib/server/db/controllers/accounts'
import { type ExtendedInsertGenre, GenresDatabase } from '$lib/server/db/controllers/genre'
import { GenreHistoryDatabase } from '$lib/server/db/controllers/genre-history'
import { createGenreHistoryEntry } from '$lib/server/genres'

import { test } from '../../../../vitest-setup'
import getManyGenres from './get-many'

function getTestGenre(data?: Partial<ExtendedInsertGenre>): ExtendedInsertGenre {
  return { name: 'Test', akas: [], parents: [], influencedBy: [], updatedAt: new Date(), ...data }
}

test('should return an empty array of genres when there are no genres in the DB', async ({
  dbConnection,
}) => {
  const result = await getManyGenres({}, dbConnection)

  expect(result).toEqual({
    data: [],
    pagination: {
      skip: 0,
      limit: 10,
      total: 0,
    },
  })
})

test('should return an array of genres when there are genres in the DB', async ({
  dbConnection,
}) => {
  const genresDb = new GenresDatabase()
  await genresDb.insert([getTestGenre()], dbConnection)

  const result = await getManyGenres({}, dbConnection)

  expect(result).toEqual({
    data: [
      {
        id: 1,
        name: 'Test',
        subtitle: null,
        type: 'STYLE',
        nsfw: false,
        shortDescription: null,
        longDescription: null,
        notes: null,
        relevance: 99,
        createdAt: expect.any(Date) as Date,
        updatedAt: expect.any(Date) as Date,
      },
    ],
    pagination: {
      skip: 0,
      limit: 10,
      total: 1,
    },
  })
})

test('should paginate the results', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  await genresDb.insert(
    [
      getTestGenre({ name: 'Test 1' }),
      getTestGenre({ name: 'Test 2' }),
      getTestGenre({ name: 'Test 3' }),
      getTestGenre({ name: 'Test 4' }),
      getTestGenre({ name: 'Test 5' }),
    ],
    dbConnection,
  )

  const result = await getManyGenres({ skip: 2, limit: 2 }, dbConnection)

  expect(result).toEqual({
    data: [
      expect.objectContaining({ name: 'Test 3' }),
      expect.objectContaining({ name: 'Test 4' }),
    ],
    pagination: {
      skip: 2,
      limit: 2,
      total: 5,
    },
  })
})

test('should handle a limit that is larger than the number of genres in the DB', async ({
  dbConnection,
}) => {
  const genresDb = new GenresDatabase()
  await genresDb.insert([getTestGenre({ name: 'Test' })], dbConnection)

  const result = await getManyGenres({ limit: 10 }, dbConnection)

  expect(result).toEqual({
    data: [expect.objectContaining({ name: 'Test' })],
    pagination: {
      skip: 0,
      limit: 10,
      total: 1,
    },
  })
})

test('should handle a skip that is larger than the number of genres in the DB', async ({
  dbConnection,
}) => {
  const genresDb = new GenresDatabase()
  await genresDb.insert([getTestGenre()], dbConnection)

  const result = await getManyGenres({ skip: 10 }, dbConnection)

  expect(result).toEqual({
    data: [],
    pagination: {
      skip: 10,
      limit: 10,
      total: 1,
    },
  })
})

test('should handle a limit of 0', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  await genresDb.insert([getTestGenre()], dbConnection)

  const result = await getManyGenres({ limit: 0 }, dbConnection)

  expect(result).toEqual({
    data: [],
    pagination: {
      skip: 0,
      limit: 0,
      total: 1,
    },
  })
})

test('should include parent ids when requested', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  await genresDb.insert(
    [getTestGenre({ name: 'Test 1', parents: [2] }), getTestGenre({ name: 'Test 2', parents: [] })],
    dbConnection,
  )

  const result = await getManyGenres({ include: ['parents'] }, dbConnection)

  expect(result.data).toEqual([
    expect.objectContaining({
      name: 'Test 1',
      parents: [2],
    }),
    expect.objectContaining({
      name: 'Test 2',
      parents: [],
    }),
  ])
})

test('should include influencedBy ids when requested', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  await genresDb.insert(
    [
      getTestGenre({ name: 'Test 1', influencedBy: [2] }),
      getTestGenre({ name: 'Test 2', influencedBy: [] }),
    ],
    dbConnection,
  )

  const result = await getManyGenres({ include: ['influencedBy'] }, dbConnection)

  expect(result.data).toEqual([
    expect.objectContaining({
      name: 'Test 1',
      influencedBy: [2],
    }),
    expect.objectContaining({
      name: 'Test 2',
      influencedBy: [],
    }),
  ])
})

test('should include akas when requested', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  await genresDb.insert(
    [
      getTestGenre({
        name: 'Test 1',
        akas: [
          { relevance: 1, order: 1, name: 'tertiary-two' },
          { relevance: 1, order: 0, name: 'tertiary-one' },
          { relevance: 2, order: 1, name: 'secondary-two' },
          { relevance: 2, order: 0, name: 'secondary-one' },
          { relevance: 3, order: 0, name: 'primary-one' },
          { relevance: 3, order: 1, name: 'primary-two' },
        ],
      }),
      getTestGenre({
        name: 'Test 2',
        influencedBy: [],
      }),
    ],
    dbConnection,
  )

  const result = await getManyGenres({ include: ['akas'] }, dbConnection)

  expect(result.data).toEqual([
    expect.objectContaining({
      name: 'Test 1',
      akas: {
        primary: ['primary-one', 'primary-two'],
        secondary: ['secondary-one', 'secondary-two'],
        tertiary: ['tertiary-one', 'tertiary-two'],
      },
    }),
    expect.objectContaining({
      name: 'Test 2',
      akas: {
        primary: [],
        secondary: [],
        tertiary: [],
      },
    }),
  ])
})

test('should allow filtering by creator account id', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  const [genre] = await genresDb.insert(
    [getTestGenre({ name: 'Test 1' }), getTestGenre({ name: 'Test 2' })],
    dbConnection,
  )

  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert(
    [{ username: 'Testing', password: 'Pass' }],
    dbConnection,
  )

  const genreHistoryDb = new GenreHistoryDatabase()
  await createGenreHistoryEntry({
    genre,
    accountId: account.id,
    operation: 'CREATE',
    genreHistoryDb,
    connection: dbConnection,
  })

  const result = await getManyGenres({ filter: { createdBy: account.id } }, dbConnection)

  expect(result.data).toEqual([expect.objectContaining({ name: 'Test 1' })])
})

test('should allow filtering by empty shortDescription', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  await genresDb.insert(
    [
      getTestGenre({
        name: 'Test 1',
        shortDescription: '',
      }),
      getTestGenre({
        name: 'Test 2',
        shortDescription: null,
      }),
      getTestGenre({
        name: 'Test 3',
        shortDescription: undefined,
      }),
      getTestGenre({
        name: 'Test 4',
        shortDescription: 'Short',
      }),
    ],
    dbConnection,
  )

  const result = await getManyGenres({ filter: { shortDescription: '' } }, dbConnection)

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'Test 1' }),
    expect.objectContaining({ name: 'Test 2' }),
    expect.objectContaining({ name: 'Test 3' }),
  ])
})

test('should allow filtering by null shortDescription', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  await genresDb.insert(
    [
      getTestGenre({
        name: 'Test 1',
        shortDescription: '',
      }),
      getTestGenre({
        name: 'Test 2',
        shortDescription: null,
      }),
      getTestGenre({
        name: 'Test 3',
        shortDescription: undefined,
      }),
      getTestGenre({
        name: 'Test 4',
        shortDescription: 'Short',
      }),
    ],
    dbConnection,
  )

  const result = await getManyGenres({ filter: { shortDescription: null } }, dbConnection)

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'Test 1' }),
    expect.objectContaining({ name: 'Test 2' }),
    expect.objectContaining({ name: 'Test 3' }),
  ])
})

test('should allow filtering by non-empty shortDescription', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  await genresDb.insert(
    [
      getTestGenre({
        name: 'Test 1',
        shortDescription: '',
      }),
      getTestGenre({
        name: 'Test 2',
        shortDescription: null,
      }),
      getTestGenre({
        name: 'Test 3',
        shortDescription: undefined,
      }),
      getTestGenre({
        name: 'Test 4',
        shortDescription: 'Short',
      }),
    ],
    dbConnection,
  )

  const result = await getManyGenres({ filter: { shortDescription: 'Short' } }, dbConnection)

  expect(result.data).toEqual([expect.objectContaining({ name: 'Test 4' })])
})
