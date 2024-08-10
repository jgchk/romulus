import { expect } from 'vitest'

import { AccountsDatabase } from '$lib/server/db/controllers/accounts'
import { type ExtendedInsertGenre, GenresDatabase } from '$lib/server/db/controllers/genre'
import { GenreHistoryDatabase } from '$lib/server/db/controllers/genre-history'
import { createGenreHistoryEntry } from '$lib/server/genres'
import { UNSET_GENRE_RELEVANCE } from '$lib/types/genres'

import { test } from '../../../../vitest-setup'
import getManyGenres from './get-many'

function getTestGenre(data?: Partial<ExtendedInsertGenre>): ExtendedInsertGenre {
  return { name: 'Test', akas: [], parents: [], influencedBy: [], updatedAt: new Date(), ...data }
}

test('should have a default limit', async ({ dbConnection }) => {
  const result = await getManyGenres({}, dbConnection)
  expect(result.pagination.limit).toBe(25)
})

test('should return an empty array of genres when there are no genres in the DB', async ({
  dbConnection,
}) => {
  const result = await getManyGenres({}, dbConnection)
  expect(result.data).toEqual([])
  expect(result.pagination.total).toBe(0)
})

test('should return an array of genres when there are genres in the DB', async ({
  dbConnection,
}) => {
  const genresDb = new GenresDatabase()
  await genresDb.insert([getTestGenre()], dbConnection)

  const result = await getManyGenres({}, dbConnection)
  expect(result.data).toEqual([
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
  ])
  expect(result.pagination.total).toEqual(1)
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
      limit: expect.any(Number) as number,
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

test('should allow filtering on name by exact match', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  await genresDb.insert(
    [getTestGenre({ name: 'Test 1' }), getTestGenre({ name: 'Test 2' })],
    dbConnection,
  )

  const result = await getManyGenres({ filter: { name: 'Test 2' } }, dbConnection)

  expect(result.data).toEqual([expect.objectContaining({ name: 'Test 2' })])
})

test('should allow filtering on subtitle by exact match', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  await genresDb.insert(
    [
      getTestGenre({ name: 'Test 1', subtitle: '' }),
      getTestGenre({ name: 'Test 2', subtitle: null }),
      getTestGenre({ name: 'Test 3', subtitle: undefined }),
      getTestGenre({ name: 'Test 4', subtitle: 'Test Subtitle' }),
    ],
    dbConnection,
  )

  const result = await getManyGenres({ filter: { subtitle: 'Test Subtitle' } }, dbConnection)

  expect(result.data).toEqual([expect.objectContaining({ name: 'Test 4' })])
})

test('should allow filtering on subtitle by empty string', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  await genresDb.insert(
    [
      getTestGenre({ name: 'Test 1', subtitle: '' }),
      getTestGenre({ name: 'Test 2', subtitle: null }),
      getTestGenre({ name: 'Test 3', subtitle: undefined }),
      getTestGenre({ name: 'Test 4', subtitle: 'Test Subtitle' }),
    ],
    dbConnection,
  )

  const result = await getManyGenres({ filter: { subtitle: '' } }, dbConnection)

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'Test 1' }),
    expect.objectContaining({ name: 'Test 2' }),
    expect.objectContaining({ name: 'Test 3' }),
  ])
})

test('should allow filtering on subtitle by null', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  await genresDb.insert(
    [
      getTestGenre({ name: 'Test 1', subtitle: '' }),
      getTestGenre({ name: 'Test 2', subtitle: null }),
      getTestGenre({ name: 'Test 3', subtitle: undefined }),
      getTestGenre({ name: 'Test 4', subtitle: 'Test Subtitle' }),
    ],
    dbConnection,
  )

  const result = await getManyGenres({ filter: { subtitle: null } }, dbConnection)

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'Test 1' }),
    expect.objectContaining({ name: 'Test 2' }),
    expect.objectContaining({ name: 'Test 3' }),
  ])
})

test('should allow filtering on type by exact match', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  await genresDb.insert(
    [
      getTestGenre({ name: 'Test 1', type: 'STYLE' }),
      getTestGenre({ name: 'Test 2', type: 'META' }),
    ],
    dbConnection,
  )

  const result = await getManyGenres({ filter: { type: 'META' } }, dbConnection)

  expect(result.data).toEqual([expect.objectContaining({ name: 'Test 2' })])
})

test('should allow filtering on relevance by exact match', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  await genresDb.insert(
    [
      getTestGenre({ name: 'Test 1', relevance: 1 }),
      getTestGenre({ name: 'Test 2', relevance: 2 }),
    ],
    dbConnection,
  )

  const result = await getManyGenres({ filter: { relevance: 2 } }, dbConnection)

  expect(result.data).toEqual([expect.objectContaining({ name: 'Test 2' })])
})

test('should allow filtering on relevance by unset value', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  await genresDb.insert(
    [
      getTestGenre({ name: 'Test 1', relevance: 1 }),
      getTestGenre({ name: 'Test 2', relevance: UNSET_GENRE_RELEVANCE }),
      getTestGenre({ name: 'Test 3', relevance: undefined }),
    ],
    dbConnection,
  )

  const result = await getManyGenres({ filter: { relevance: UNSET_GENRE_RELEVANCE } }, dbConnection)

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'Test 2' }),
    expect.objectContaining({ name: 'Test 3' }),
  ])
})

test('should allow filtering on relevance by null', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  await genresDb.insert(
    [
      getTestGenre({ name: 'Test 1', relevance: 1 }),
      getTestGenre({ name: 'Test 2', relevance: UNSET_GENRE_RELEVANCE }),
      getTestGenre({ name: 'Test 3', relevance: undefined }),
    ],
    dbConnection,
  )

  const result = await getManyGenres({ filter: { relevance: null } }, dbConnection)

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'Test 2' }),
    expect.objectContaining({ name: 'Test 3' }),
  ])
})

test('should allow filtering on NSFW by exact match', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  await genresDb.insert(
    [getTestGenre({ name: 'Test 1', nsfw: true }), getTestGenre({ name: 'Test 2', nsfw: false })],
    dbConnection,
  )

  const result = await getManyGenres({ filter: { nsfw: false } }, dbConnection)

  expect(result.data).toEqual([expect.objectContaining({ name: 'Test 2' })])
})

test('should allow filtering on shortDescription by exact match', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  await genresDb.insert(
    [
      getTestGenre({ name: 'Test 1', shortDescription: '' }),
      getTestGenre({ name: 'Test 2', shortDescription: null }),
      getTestGenre({ name: 'Test 3', shortDescription: undefined }),
      getTestGenre({ name: 'Test 4', shortDescription: 'Short' }),
    ],
    dbConnection,
  )

  const result = await getManyGenres({ filter: { shortDescription: 'Short' } }, dbConnection)

  expect(result.data).toEqual([expect.objectContaining({ name: 'Test 4' })])
})

test('should allow filtering on shortDescription by empty string', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  await genresDb.insert(
    [
      getTestGenre({ name: 'Test 1', shortDescription: '' }),
      getTestGenre({ name: 'Test 2', shortDescription: null }),
      getTestGenre({ name: 'Test 3', shortDescription: undefined }),
      getTestGenre({ name: 'Test 4', shortDescription: 'Short' }),
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

test('should allow filtering on shortDescription by null', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  await genresDb.insert(
    [
      getTestGenre({ name: 'Test 1', shortDescription: '' }),
      getTestGenre({ name: 'Test 2', shortDescription: null }),
      getTestGenre({ name: 'Test 3', shortDescription: undefined }),
      getTestGenre({ name: 'Test 4', shortDescription: 'Short' }),
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

test('should allow filtering on longDescription by exact match', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  await genresDb.insert(
    [
      getTestGenre({ name: 'Test 1', longDescription: '' }),
      getTestGenre({ name: 'Test 2', longDescription: null }),
      getTestGenre({ name: 'Test 3', longDescription: undefined }),
      getTestGenre({ name: 'Test 4', longDescription: 'Long' }),
    ],
    dbConnection,
  )

  const result = await getManyGenres({ filter: { longDescription: 'Long' } }, dbConnection)

  expect(result.data).toEqual([expect.objectContaining({ name: 'Test 4' })])
})

test('should allow filtering on longDescription by empty string', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  await genresDb.insert(
    [
      getTestGenre({ name: 'Test 1', longDescription: '' }),
      getTestGenre({ name: 'Test 2', longDescription: null }),
      getTestGenre({ name: 'Test 3', longDescription: undefined }),
      getTestGenre({ name: 'Test 4', longDescription: 'Long' }),
    ],
    dbConnection,
  )

  const result = await getManyGenres({ filter: { longDescription: '' } }, dbConnection)

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'Test 1' }),
    expect.objectContaining({ name: 'Test 2' }),
    expect.objectContaining({ name: 'Test 3' }),
  ])
})

test('should allow filtering on longDescription by null', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  await genresDb.insert(
    [
      getTestGenre({ name: 'Test 1', longDescription: '' }),
      getTestGenre({ name: 'Test 2', longDescription: null }),
      getTestGenre({ name: 'Test 3', longDescription: undefined }),
      getTestGenre({ name: 'Test 4', longDescription: 'Long' }),
    ],
    dbConnection,
  )

  const result = await getManyGenres({ filter: { longDescription: null } }, dbConnection)

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'Test 1' }),
    expect.objectContaining({ name: 'Test 2' }),
    expect.objectContaining({ name: 'Test 3' }),
  ])
})

test('should allow filtering on notes by exact match', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  await genresDb.insert(
    [
      getTestGenre({ name: 'Test 1', notes: '' }),
      getTestGenre({ name: 'Test 2', notes: null }),
      getTestGenre({ name: 'Test 3', notes: undefined }),
      getTestGenre({ name: 'Test 4', notes: 'Notes' }),
    ],
    dbConnection,
  )

  const result = await getManyGenres({ filter: { notes: 'Notes' } }, dbConnection)

  expect(result.data).toEqual([expect.objectContaining({ name: 'Test 4' })])
})

test('should allow filtering on notes by empty string', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  await genresDb.insert(
    [
      getTestGenre({ name: 'Test 1', notes: '' }),
      getTestGenre({ name: 'Test 2', notes: null }),
      getTestGenre({ name: 'Test 3', notes: undefined }),
      getTestGenre({ name: 'Test 4', notes: 'Notes' }),
    ],
    dbConnection,
  )

  const result = await getManyGenres({ filter: { notes: '' } }, dbConnection)

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'Test 1' }),
    expect.objectContaining({ name: 'Test 2' }),
    expect.objectContaining({ name: 'Test 3' }),
  ])
})

test('should allow filtering on notes by null', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  await genresDb.insert(
    [
      getTestGenre({ name: 'Test 1', notes: '' }),
      getTestGenre({ name: 'Test 2', notes: null }),
      getTestGenre({ name: 'Test 3', notes: undefined }),
      getTestGenre({ name: 'Test 4', notes: 'Notes' }),
    ],
    dbConnection,
  )

  const result = await getManyGenres({ filter: { notes: null } }, dbConnection)

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'Test 1' }),
    expect.objectContaining({ name: 'Test 2' }),
    expect.objectContaining({ name: 'Test 3' }),
  ])
})

test('should allow filtering on createdAt by exact match', async ({ dbConnection }) => {
  const date1 = new Date()
  const date2 = new Date(date1.getTime() + 1000)

  const genresDb = new GenresDatabase()
  await genresDb.insert(
    [
      getTestGenre({ name: 'Test 1', createdAt: date1 }),
      getTestGenre({ name: 'Test 2', createdAt: date2 }),
    ],
    dbConnection,
  )

  const result = await getManyGenres({ filter: { createdAt: date1 } }, dbConnection)

  expect(result.data).toEqual([expect.objectContaining({ name: 'Test 1' })])
})

test('should allow filtering on updatedAt by exact match', async ({ dbConnection }) => {
  const date1 = new Date()
  const date2 = new Date(date1.getTime() + 1000)

  const genresDb = new GenresDatabase()
  await genresDb.insert(
    [
      getTestGenre({ name: 'Test 1', updatedAt: date1 }),
      getTestGenre({ name: 'Test 2', updatedAt: date2 }),
    ],
    dbConnection,
  )

  const result = await getManyGenres({ filter: { updatedAt: date1 } }, dbConnection)

  expect(result.data).toEqual([expect.objectContaining({ name: 'Test 1' })])
})

test('should allow filtering by createdBy', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  const [genre1, genre2] = await genresDb.insert(
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
    genre: genre1,
    accountId: account.id,
    operation: 'CREATE',
    genreHistoryDb,
    connection: dbConnection,
  })
  await createGenreHistoryEntry({
    genre: genre2,
    accountId: account.id,
    operation: 'UPDATE',
    genreHistoryDb,
    connection: dbConnection,
  })

  const result = await getManyGenres({ filter: { createdBy: account.id } }, dbConnection)

  expect(result.data).toEqual([expect.objectContaining({ name: 'Test 1' })])
})

test('should allow filtering by both createdBy and name', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  const genres = await genresDb.insert(
    [getTestGenre({ name: 'Test 1' }), getTestGenre({ name: 'Test 2' })],
    dbConnection,
  )

  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert(
    [{ username: 'Testing', password: 'Pass' }],
    dbConnection,
  )

  const genreHistoryDb = new GenreHistoryDatabase()
  await Promise.all(
    genres.map((genre) =>
      createGenreHistoryEntry({
        genre,
        accountId: account.id,
        operation: 'CREATE',
        genreHistoryDb,
        connection: dbConnection,
      }),
    ),
  )

  const result = await getManyGenres(
    { filter: { name: 'Test 1', createdBy: account.id } },
    dbConnection,
  )

  expect(result.data).toEqual([expect.objectContaining({ name: 'Test 1' })])
})

test('should allow sorting by id', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  await genresDb.insert(
    [
      getTestGenre({ id: 2, name: 'A' }),
      getTestGenre({ id: 0, name: 'B' }),
      getTestGenre({ id: 1, name: 'C' }),
    ],
    dbConnection,
  )

  const result = await getManyGenres({ sort: { field: 'id' } }, dbConnection)

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'B' }),
    expect.objectContaining({ name: 'C' }),
    expect.objectContaining({ name: 'A' }),
  ])
})

test('should allow sorting by id in ascending order', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  await genresDb.insert(
    [
      getTestGenre({ id: 2, name: 'A' }),
      getTestGenre({ id: 0, name: 'B' }),
      getTestGenre({ id: 1, name: 'C' }),
    ],
    dbConnection,
  )

  const result = await getManyGenres({ sort: { field: 'id', order: 'asc' } }, dbConnection)

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'B' }),
    expect.objectContaining({ name: 'C' }),
    expect.objectContaining({ name: 'A' }),
  ])
})

test('should allow sorting by id in descending order', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  await genresDb.insert(
    [
      getTestGenre({ id: 2, name: 'A' }),
      getTestGenre({ id: 0, name: 'B' }),
      getTestGenre({ id: 1, name: 'C' }),
    ],
    dbConnection,
  )

  const result = await getManyGenres({ sort: { field: 'id', order: 'desc' } }, dbConnection)

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'A' }),
    expect.objectContaining({ name: 'C' }),
    expect.objectContaining({ name: 'B' }),
  ])
})

test('should sort by id by default', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  await genresDb.insert(
    [
      getTestGenre({ id: 2, name: 'A' }),
      getTestGenre({ id: 0, name: 'B' }),
      getTestGenre({ id: 1, name: 'C' }),
    ],
    dbConnection,
  )

  const result = await getManyGenres({}, dbConnection)

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'B' }),
    expect.objectContaining({ name: 'C' }),
    expect.objectContaining({ name: 'A' }),
  ])
})

test('should allow sorting by name', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  await genresDb.insert(
    [getTestGenre({ name: 'C' }), getTestGenre({ name: 'A' }), getTestGenre({ name: 'B' })],
    dbConnection,
  )

  const result = await getManyGenres({ sort: { field: 'name' } }, dbConnection)

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'A' }),
    expect.objectContaining({ name: 'B' }),
    expect.objectContaining({ name: 'C' }),
  ])
})

test('should allow sorting by name in ascending order', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  await genresDb.insert(
    [getTestGenre({ name: 'C' }), getTestGenre({ name: 'A' }), getTestGenre({ name: 'B' })],
    dbConnection,
  )

  const result = await getManyGenres({ sort: { field: 'name', order: 'asc' } }, dbConnection)

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'A' }),
    expect.objectContaining({ name: 'B' }),
    expect.objectContaining({ name: 'C' }),
  ])
})

test('should sorting by name in descending order', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  await genresDb.insert(
    [getTestGenre({ name: 'C' }), getTestGenre({ name: 'A' }), getTestGenre({ name: 'B' })],
    dbConnection,
  )

  const result = await getManyGenres({ sort: { field: 'name', order: 'desc' } }, dbConnection)

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'C' }),
    expect.objectContaining({ name: 'B' }),
    expect.objectContaining({ name: 'A' }),
  ])
})
