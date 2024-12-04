import { expect } from 'vitest'

import type { IDrizzleConnection } from '$lib/server/db/connection'
import { AccountsDatabase } from '$lib/server/db/controllers/accounts'
import { UNSET_GENRE_RELEVANCE } from '$lib/types/genres'

import { test } from '../../../../../../vitest-setup'
import {
  CreateGenreCommand,
  type CreateGenreInput,
} from '../../commands/application/commands/create-genre'
import { VoteGenreRelevanceCommand } from '../../commands/application/commands/vote-genre-relevance'
import { DrizzleGenreHistoryRepository } from '../../commands/infrastructure/drizzle-genre-history-repository'
import { DrizzleGenreRelevanceVoteRepository } from '../../commands/infrastructure/drizzle-genre-relevance-vote-repository'
import { DrizzleGenreRepository } from '../../commands/infrastructure/drizzle-genre-repository'
import { DrizzleGenreTreeRepository } from '../../commands/infrastructure/drizzle-genre-tree-repository'
import { GetAllGenresQuery } from './get-all-genres'

async function createGenre(
  data: CreateGenreInput & { relevance?: number },
  accountId: number,
  dbConnection: IDrizzleConnection,
) {
  const createGenreCommand = new CreateGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreTreeRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
  )

  const genre = await createGenreCommand.execute(data, accountId)

  if (genre instanceof Error) {
    expect.fail(`Failed to create genre: ${genre.message}`)
  }

  if (data.relevance !== undefined) {
    const voteRelevanceCommand = new VoteGenreRelevanceCommand(
      new DrizzleGenreRelevanceVoteRepository(dbConnection),
    )

    const result = await voteRelevanceCommand.execute(genre.id, data.relevance, accountId)

    if (result instanceof Error) {
      expect.fail(`Failed to vote on genre relevance: ${result.message}`)
    }
  }

  return genre
}

function getTestGenre(
  data?: Partial<CreateGenreInput> & { relevance?: number },
): CreateGenreInput & { relevance?: number } {
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

test('should have a default limit', async ({ dbConnection }) => {
  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({})
  expect(result.pagination.limit).toBe(25)
})

test('should return an empty array of genres when there are no genres in the DB', async ({
  dbConnection,
}) => {
  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({})
  expect(result.data).toEqual([])
  expect(result.pagination.total).toBe(0)
})

test('should return an array of genres when there are genres in the DB', async ({
  dbConnection,
}) => {
  const accountId = new AccountsDatabase()
  const [account] = await accountId.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  await createGenre(getTestGenre(), account.id, dbConnection)

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({})
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
  const accountId = new AccountsDatabase()
  const [account] = await accountId.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  await Promise.all(
    [
      getTestGenre({ name: 'Test 1' }),
      getTestGenre({ name: 'Test 2' }),
      getTestGenre({ name: 'Test 3' }),
      getTestGenre({ name: 'Test 4' }),
      getTestGenre({ name: 'Test 5' }),
    ].map((genre) => createGenre(genre, account.id, dbConnection)),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ skip: 2, limit: 2 })

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
  const accountId = new AccountsDatabase()
  const [account] = await accountId.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  await createGenre(getTestGenre({ name: 'Test' }), account.id, dbConnection)

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ limit: 10 })

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
  const accountId = new AccountsDatabase()
  const [account] = await accountId.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  await createGenre(getTestGenre(), account.id, dbConnection)

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ skip: 10 })

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
  const accountId = new AccountsDatabase()
  const [account] = await accountId.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  await createGenre(getTestGenre(), account.id, dbConnection)

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ limit: 0 })

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
  const accountId = new AccountsDatabase()
  const [account] = await accountId.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  const test1 = await createGenre(getTestGenre({ name: 'Test 1' }), account.id, dbConnection)
  await createGenre(
    getTestGenre({ name: 'Test 2', parents: new Set([test1.id]) }),
    account.id,
    dbConnection,
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ include: ['parents'] })

  expect(result.data).toEqual([
    expect.objectContaining({
      name: 'Test 1',
      parents: [],
    }),
    expect.objectContaining({
      name: 'Test 2',
      parents: [test1.id],
    }),
  ])
})

test('should include influencedBy ids when requested', async ({ dbConnection }) => {
  const accountId = new AccountsDatabase()
  const [account] = await accountId.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  const test1 = await createGenre(getTestGenre({ name: 'Test 1' }), account.id, dbConnection)
  await createGenre(
    getTestGenre({ name: 'Test 2', influences: new Set([test1.id]) }),
    account.id,
    dbConnection,
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ include: ['influencedBy'] })

  expect(result.data).toEqual([
    expect.objectContaining({
      name: 'Test 1',
      influencedBy: [],
    }),
    expect.objectContaining({
      name: 'Test 2',
      influencedBy: [test1.id],
    }),
  ])
})

test('should include akas when requested', async ({ dbConnection }) => {
  const accountId = new AccountsDatabase()
  const [account] = await accountId.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  await createGenre(
    getTestGenre({
      name: 'Test 1',
      akas: {
        primary: ['primary-one', 'primary-two'],
        secondary: ['secondary-one', 'secondary-two'],
        tertiary: ['tertiary-one', 'tertiary-two'],
      },
    }),
    account.id,
    dbConnection,
  )
  await createGenre(getTestGenre({ name: 'Test 2' }), account.id, dbConnection)

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ include: ['akas'] })

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
  const accountId = new AccountsDatabase()
  const [account] = await accountId.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  await createGenre(getTestGenre({ name: 'Test 1' }), account.id, dbConnection)
  await createGenre(getTestGenre({ name: 'Test 2' }), account.id, dbConnection)

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ filter: { name: 'Test 2' } })

  expect(result.data).toEqual([expect.objectContaining({ name: 'Test 2' })])
})

test('should allow filtering on subtitle by exact match', async ({ dbConnection }) => {
  const accountId = new AccountsDatabase()
  const [account] = await accountId.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  await Promise.all(
    [
      getTestGenre({ name: 'Test 1', subtitle: '' }),
      getTestGenre({ name: 'Test 2', subtitle: undefined }),
      getTestGenre({ name: 'Test 3', subtitle: 'Test Subtitle' }),
    ].map((genre) => createGenre(genre, account.id, dbConnection)),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ filter: { subtitle: 'Test Subtitle' } })

  expect(result.data).toEqual([expect.objectContaining({ name: 'Test 3' })])
})

test('should allow filtering on subtitle by empty string', async ({ dbConnection }) => {
  const accountId = new AccountsDatabase()
  const [account] = await accountId.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  await Promise.all(
    [
      getTestGenre({ name: 'Test 1', subtitle: '' }),
      getTestGenre({ name: 'Test 2', subtitle: undefined }),
      getTestGenre({ name: 'Test 3', subtitle: 'Test Subtitle' }),
    ].map((genre) => createGenre(genre, account.id, dbConnection)),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ filter: { subtitle: '' } })

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'Test 1' }),
    expect.objectContaining({ name: 'Test 2' }),
  ])
})

test('should allow filtering on subtitle by null', async ({ dbConnection }) => {
  const accountId = new AccountsDatabase()
  const [account] = await accountId.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  await Promise.all(
    [
      getTestGenre({ name: 'Test 1', subtitle: '' }),
      getTestGenre({ name: 'Test 2', subtitle: undefined }),
      getTestGenre({ name: 'Test 3', subtitle: 'Test Subtitle' }),
    ].map((genre) => createGenre(genre, account.id, dbConnection)),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ filter: { subtitle: null } })

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'Test 1' }),
    expect.objectContaining({ name: 'Test 2' }),
  ])
})

test('should allow filtering on type by exact match', async ({ dbConnection }) => {
  const accountId = new AccountsDatabase()
  const [account] = await accountId.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  await Promise.all(
    [
      getTestGenre({ name: 'Test 1', type: 'STYLE' }),
      getTestGenre({ name: 'Test 2', type: 'META' }),
    ].map((genre) => createGenre(genre, account.id, dbConnection)),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ filter: { type: 'META' } })

  expect(result.data).toEqual([expect.objectContaining({ name: 'Test 2' })])
})

test('should allow filtering on relevance by exact match', async ({ dbConnection }) => {
  const accountId = new AccountsDatabase()
  const [account] = await accountId.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  await Promise.all(
    [
      getTestGenre({ name: 'Test 1', relevance: 1 }),
      getTestGenre({ name: 'Test 2', relevance: 2 }),
    ].map((genre) => createGenre(genre, account.id, dbConnection)),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ filter: { relevance: 2 } })

  expect(result.data).toEqual([expect.objectContaining({ name: 'Test 2' })])
})

test('should allow filtering on relevance by unset value', async ({ dbConnection }) => {
  const accountId = new AccountsDatabase()
  const [account] = await accountId.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  await Promise.all(
    [
      getTestGenre({ name: 'Test 1', relevance: 1 }),
      getTestGenre({ name: 'Test 2', relevance: UNSET_GENRE_RELEVANCE }),
      getTestGenre({ name: 'Test 3', relevance: undefined }),
    ].map((genre) => createGenre(genre, account.id, dbConnection)),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ filter: { relevance: UNSET_GENRE_RELEVANCE } })

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'Test 2' }),
    expect.objectContaining({ name: 'Test 3' }),
  ])
})

test('should allow filtering on relevance by null', async ({ dbConnection }) => {
  const accountId = new AccountsDatabase()
  const [account] = await accountId.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  await Promise.all(
    [
      getTestGenre({ name: 'Test 1', relevance: 1 }),
      getTestGenre({ name: 'Test 2', relevance: UNSET_GENRE_RELEVANCE }),
      getTestGenre({ name: 'Test 3', relevance: undefined }),
    ].map((genre) => createGenre(genre, account.id, dbConnection)),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ filter: { relevance: null } })

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'Test 2' }),
    expect.objectContaining({ name: 'Test 3' }),
  ])
})

test('should allow filtering on NSFW by exact match', async ({ dbConnection }) => {
  const accountId = new AccountsDatabase()
  const [account] = await accountId.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  await Promise.all(
    [
      getTestGenre({ name: 'Test 1', nsfw: true }),
      getTestGenre({ name: 'Test 2', nsfw: false }),
    ].map((genre) => createGenre(genre, account.id, dbConnection)),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ filter: { nsfw: false } })

  expect(result.data).toEqual([expect.objectContaining({ name: 'Test 2' })])
})

test('should allow filtering on shortDescription by exact match', async ({ dbConnection }) => {
  const accountId = new AccountsDatabase()
  const [account] = await accountId.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  await Promise.all(
    [
      getTestGenre({ name: 'Test 1', shortDescription: '' }),
      getTestGenre({ name: 'Test 2', shortDescription: undefined }),
      getTestGenre({ name: 'Test 3', shortDescription: 'Short' }),
    ].map((genre) => createGenre(genre, account.id, dbConnection)),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ filter: { shortDescription: 'Short' } })

  expect(result.data).toEqual([expect.objectContaining({ name: 'Test 3' })])
})

test('should allow filtering on shortDescription by empty string', async ({ dbConnection }) => {
  const accountId = new AccountsDatabase()
  const [account] = await accountId.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  await Promise.all(
    [
      getTestGenre({ name: 'Test 1', shortDescription: '' }),
      getTestGenre({ name: 'Test 2', shortDescription: undefined }),
      getTestGenre({ name: 'Test 3', shortDescription: 'Short' }),
    ].map((genre) => createGenre(genre, account.id, dbConnection)),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ filter: { shortDescription: '' } })

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'Test 1' }),
    expect.objectContaining({ name: 'Test 2' }),
  ])
})

test('should allow filtering on shortDescription by null', async ({ dbConnection }) => {
  const accountId = new AccountsDatabase()
  const [account] = await accountId.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  await Promise.all(
    [
      getTestGenre({ name: 'Test 1', shortDescription: '' }),
      getTestGenre({ name: 'Test 2', shortDescription: undefined }),
      getTestGenre({ name: 'Test 3', shortDescription: 'Short' }),
    ].map((genre) => createGenre(genre, account.id, dbConnection)),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ filter: { shortDescription: null } })

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'Test 1' }),
    expect.objectContaining({ name: 'Test 2' }),
  ])
})

test('should allow filtering on longDescription by exact match', async ({ dbConnection }) => {
  const accountId = new AccountsDatabase()
  const [account] = await accountId.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  await Promise.all(
    [
      getTestGenre({ name: 'Test 1', longDescription: '' }),
      getTestGenre({ name: 'Test 2', longDescription: undefined }),
      getTestGenre({ name: 'Test 3', longDescription: 'Long' }),
    ].map((genre) => createGenre(genre, account.id, dbConnection)),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ filter: { longDescription: 'Long' } })

  expect(result.data).toEqual([expect.objectContaining({ name: 'Test 3' })])
})

test('should allow filtering on longDescription by empty string', async ({ dbConnection }) => {
  const accountId = new AccountsDatabase()
  const [account] = await accountId.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  await Promise.all(
    [
      getTestGenre({ name: 'Test 1', longDescription: '' }),
      getTestGenre({ name: 'Test 2', longDescription: undefined }),
      getTestGenre({ name: 'Test 3', longDescription: 'Long' }),
    ].map((genre) => createGenre(genre, account.id, dbConnection)),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ filter: { longDescription: '' } })

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'Test 1' }),
    expect.objectContaining({ name: 'Test 2' }),
  ])
})

test('should allow filtering on longDescription by null', async ({ dbConnection }) => {
  const accountId = new AccountsDatabase()
  const [account] = await accountId.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  await Promise.all(
    [
      getTestGenre({ name: 'Test 1', longDescription: '' }),
      getTestGenre({ name: 'Test 2', longDescription: undefined }),
      getTestGenre({ name: 'Test 3', longDescription: 'Long' }),
    ].map((genre) => createGenre(genre, account.id, dbConnection)),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ filter: { longDescription: null } })

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'Test 1' }),
    expect.objectContaining({ name: 'Test 2' }),
  ])
})

test('should allow filtering on notes by exact match', async ({ dbConnection }) => {
  const accountId = new AccountsDatabase()
  const [account] = await accountId.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  await Promise.all(
    [
      getTestGenre({ name: 'Test 1', notes: '' }),
      getTestGenre({ name: 'Test 2', notes: undefined }),
      getTestGenre({ name: 'Test 3', notes: 'Notes' }),
    ].map((genre) => createGenre(genre, account.id, dbConnection)),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ filter: { notes: 'Notes' } })

  expect(result.data).toEqual([expect.objectContaining({ name: 'Test 3' })])
})

test('should allow filtering on notes by empty string', async ({ dbConnection }) => {
  const accountId = new AccountsDatabase()
  const [account] = await accountId.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  await Promise.all(
    [
      getTestGenre({ name: 'Test 1', notes: '' }),
      getTestGenre({ name: 'Test 2', notes: undefined }),
      getTestGenre({ name: 'Test 3', notes: 'Notes' }),
    ].map((genre) => createGenre(genre, account.id, dbConnection)),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ filter: { notes: '' } })

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'Test 1' }),
    expect.objectContaining({ name: 'Test 2' }),
  ])
})

test('should allow filtering on notes by null', async ({ dbConnection }) => {
  const accountId = new AccountsDatabase()
  const [account] = await accountId.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  await Promise.all(
    [
      getTestGenre({ name: 'Test 1', notes: '' }),
      getTestGenre({ name: 'Test 2', notes: undefined }),
      getTestGenre({ name: 'Test 3', notes: 'Notes' }),
    ].map((genre) => createGenre(genre, account.id, dbConnection)),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ filter: { notes: null } })

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'Test 1' }),
    expect.objectContaining({ name: 'Test 2' }),
  ])
})

test('should allow filtering on createdAt by exact match', async ({ dbConnection }) => {
  const date1 = new Date()
  const date2 = new Date(date1.getTime() + 1000)

  const accountId = new AccountsDatabase()
  const [account] = await accountId.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  await Promise.all(
    [
      getTestGenre({ name: 'Test 1', createdAt: date1 }),
      getTestGenre({ name: 'Test 2', createdAt: date2 }),
    ].map((genre) => createGenre(genre, account.id, dbConnection)),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ filter: { createdAt: date1 } })

  expect(result.data).toEqual([expect.objectContaining({ name: 'Test 1' })])
})

test('should allow filtering on updatedAt by exact match', async ({ dbConnection }) => {
  const date1 = new Date()
  const date2 = new Date(date1.getTime() + 1000)

  const accountId = new AccountsDatabase()
  const [account] = await accountId.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  await Promise.all(
    [
      getTestGenre({ name: 'Test 1', updatedAt: date1 }),
      getTestGenre({ name: 'Test 2', updatedAt: date2 }),
    ].map((genre) => createGenre(genre, account.id, dbConnection)),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ filter: { updatedAt: date1 } })

  expect(result.data).toEqual([expect.objectContaining({ name: 'Test 1' })])
})

test('should allow filtering by createdBy', async ({ dbConnection }) => {
  const accountsDb = new AccountsDatabase()
  const [account1, account2] = await accountsDb.insert(
    [
      { username: 'Account 1', password: 'Pass' },
      { username: 'Account 2', password: 'Pass' },
    ],
    dbConnection,
  )

  await createGenre(getTestGenre({ name: 'Test 1' }), account1.id, dbConnection)
  await createGenre(getTestGenre({ name: 'Test 2' }), account2.id, dbConnection)

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ filter: { createdBy: account1.id } })

  expect(result.data).toEqual([expect.objectContaining({ name: 'Test 1' })])
})

test('should allow filtering by both createdBy and name', async ({ dbConnection }) => {
  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert(
    [{ username: 'Testing', password: 'Pass' }],
    dbConnection,
  )

  await Promise.all(
    [getTestGenre({ name: 'Test 1' }), getTestGenre({ name: 'Test 2' })].map((genre) =>
      createGenre(genre, account.id, dbConnection),
    ),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ filter: { name: 'Test 1', createdBy: account.id } })

  expect(result.data).toEqual([expect.objectContaining({ name: 'Test 1' })])
})

test('should allow filtering by parent id', async ({ dbConnection }) => {
  const accountId = new AccountsDatabase()
  const [account] = await accountId.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  const parent = await createGenre(getTestGenre({ name: 'Parent' }), account.id, dbConnection)
  await createGenre(
    getTestGenre({ name: 'Child', parents: new Set([parent.id]) }),
    account.id,
    dbConnection,
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ filter: { parents: [parent.id] } })

  expect(result.data).toEqual([expect.objectContaining({ name: 'Child' })])
})

test('should allow filtering by multiple parent ids', async ({ dbConnection }) => {
  const accountId = new AccountsDatabase()
  const [account] = await accountId.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  const parent1 = await createGenre(getTestGenre({ name: 'Parent 1' }), account.id, dbConnection)
  const parent2 = await createGenre(getTestGenre({ name: 'Parent 2' }), account.id, dbConnection)
  await createGenre(getTestGenre({ name: 'Child 1' }), account.id, dbConnection)
  await createGenre(
    getTestGenre({ name: 'Child 2', parents: new Set([parent1.id]) }),
    account.id,
    dbConnection,
  )
  await createGenre(
    getTestGenre({ name: 'Child 3', parents: new Set([parent2.id]) }),
    account.id,
    dbConnection,
  )
  await createGenre(
    getTestGenre({ name: 'Child 4', parents: new Set([parent1.id, parent2.id]) }),
    account.id,
    dbConnection,
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ filter: { parents: [parent1.id, parent2.id] } })

  expect(result.data).toEqual([expect.objectContaining({ name: 'Child 4' })])
})

test('should allow filtering by parents and createdBy', async ({ dbConnection }) => {
  const accountsDb = new AccountsDatabase()
  const [account1, account2] = await accountsDb.insert(
    [
      { username: 'Account 1', password: 'Pass' },
      { username: 'Account 2', password: 'Pass' },
    ],
    dbConnection,
  )

  const parent1 = await createGenre(getTestGenre({ name: 'Parent 1' }), account1.id, dbConnection)
  const parent2 = await createGenre(getTestGenre({ name: 'Parent 2' }), account1.id, dbConnection)
  await createGenre(getTestGenre({ name: 'Child 1' }), account1.id, dbConnection)
  await createGenre(
    getTestGenre({ name: 'Child 2', parents: new Set([parent1.id]) }),
    account1.id,
    dbConnection,
  )
  await createGenre(
    getTestGenre({ name: 'Child 3', parents: new Set([parent2.id]) }),
    account1.id,
    dbConnection,
  )
  await createGenre(
    getTestGenre({ name: 'Child 4', parents: new Set([parent1.id, parent2.id]) }),
    account1.id,
    dbConnection,
  )
  await createGenre(
    getTestGenre({ name: 'Child 5', parents: new Set([parent1.id]) }),
    account2.id,
    dbConnection,
  )
  await createGenre(
    getTestGenre({ name: 'Child 6', parents: new Set([parent2.id]) }),
    account2.id,
    dbConnection,
  )
  await createGenre(
    getTestGenre({ name: 'Child 7', parents: new Set([parent1.id, parent2.id]) }),
    account2.id,
    dbConnection,
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({
    filter: { parents: [parent1.id, parent2.id], createdBy: account2.id },
  })

  expect(result.data).toEqual([expect.objectContaining({ name: 'Child 7' })])
})

test('should return no results when filtering by parents and createdBy with no matches', async ({
  dbConnection,
}) => {
  const accountsDb = new AccountsDatabase()
  const [account1, account2] = await accountsDb.insert(
    [
      { username: 'Account 1', password: 'Pass' },
      { username: 'Account 2', password: 'Pass' },
    ],
    dbConnection,
  )

  const parent1 = await createGenre(getTestGenre({ name: 'Parent 1' }), account1.id, dbConnection)
  const parent2 = await createGenre(getTestGenre({ name: 'Parent 2' }), account1.id, dbConnection)
  await createGenre(getTestGenre({ name: 'Child 1' }), account1.id, dbConnection)
  await createGenre(
    getTestGenre({ name: 'Child 2', parents: new Set([parent1.id]) }),
    account1.id,
    dbConnection,
  )
  await createGenre(
    getTestGenre({ name: 'Child 3', parents: new Set([parent2.id]) }),
    account1.id,
    dbConnection,
  )
  await createGenre(
    getTestGenre({ name: 'Child 4', parents: new Set([parent1.id, parent2.id]) }),
    account1.id,
    dbConnection,
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({
    filter: { parents: [parent1.id, parent2.id], createdBy: account2.id },
  })

  expect(result.data).toEqual([])
})

test('should allow filtering by ancestor id', async ({ dbConnection }) => {
  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert(
    [{ username: 'Account', password: 'Pass' }],
    dbConnection,
  )

  const grandparent = await createGenre(
    getTestGenre({ name: 'Grandparent' }),
    account.id,
    dbConnection,
  )
  const parent = await createGenre(
    getTestGenre({ name: 'Parent', parents: new Set([grandparent.id]) }),
    account.id,
    dbConnection,
  )
  const child = await createGenre(
    getTestGenre({ name: 'Child', parents: new Set([parent.id]) }),
    account.id,
    dbConnection,
  )
  await createGenre(
    getTestGenre({ name: 'Grandchild', parents: new Set([child.id]) }),
    account.id,
    dbConnection,
  )
  const other1 = await createGenre(getTestGenre({ name: 'Other 1' }), account.id, dbConnection)
  await createGenre(
    getTestGenre({ name: 'Other 2', parents: new Set([other1.id]) }),
    account.id,
    dbConnection,
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ filter: { ancestors: [grandparent.id] } })

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'Parent' }),
    expect.objectContaining({ name: 'Child' }),
    expect.objectContaining({ name: 'Grandchild' }),
  ])
})

test('should allow filtering by multiple ancestor ids', async ({ dbConnection }) => {
  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert(
    [{ username: 'Account', password: 'Pass' }],
    dbConnection,
  )

  const grandparent1 = await createGenre(
    getTestGenre({ name: 'Grandparent 1' }),
    account.id,
    dbConnection,
  )
  const parent1 = await createGenre(
    getTestGenre({ name: 'Parent 1', parents: new Set([grandparent1.id]) }),
    account.id,
    dbConnection,
  )
  const child1 = await createGenre(
    getTestGenre({ name: 'Child 1', parents: new Set([parent1.id]) }),
    account.id,
    dbConnection,
  )
  const grandparent2 = await createGenre(
    getTestGenre({ name: 'Grandparent 2' }),
    account.id,
    dbConnection,
  )
  const parent2 = await createGenre(
    getTestGenre({ name: 'Parent 2', parents: new Set([grandparent2.id]) }),
    account.id,
    dbConnection,
  )
  const child2 = await createGenre(
    getTestGenre({ name: 'Child 2', parents: new Set([parent2.id]) }),
    account.id,
    dbConnection,
  )
  await createGenre(
    getTestGenre({ name: 'Grandchild', parents: new Set([child1.id, child2.id]) }),
    account.id,
    dbConnection,
  )
  await createGenre(getTestGenre({ name: 'Other 1' }), account.id, dbConnection)
  await createGenre(
    getTestGenre({ name: 'Other 2', parents: new Set([child1.id]) }),
    account.id,
    dbConnection,
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ filter: { ancestors: [grandparent1.id, parent2.id] } })

  expect(result.data).toEqual([expect.objectContaining({ name: 'Grandchild' })])
})

test('should allow sorting by id', async ({ dbConnection }) => {
  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert(
    [{ username: 'Account', password: 'Pass' }],
    dbConnection,
  )

  await Promise.all(
    [getTestGenre({ name: 'A' }), getTestGenre({ name: 'B' }), getTestGenre({ name: 'C' })].map(
      (genre) => createGenre(genre, account.id, dbConnection),
    ),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ sort: { field: 'id' } })

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'A' }),
    expect.objectContaining({ name: 'B' }),
    expect.objectContaining({ name: 'C' }),
  ])
})

test('should allow sorting by id in ascending order', async ({ dbConnection }) => {
  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert(
    [{ username: 'Account', password: 'Pass' }],
    dbConnection,
  )

  await Promise.all(
    [getTestGenre({ name: 'A' }), getTestGenre({ name: 'B' }), getTestGenre({ name: 'C' })].map(
      (genre) => createGenre(genre, account.id, dbConnection),
    ),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ sort: { field: 'id', order: 'asc' } })

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'A' }),
    expect.objectContaining({ name: 'B' }),
    expect.objectContaining({ name: 'C' }),
  ])
})

test('should allow sorting by id in descending order', async ({ dbConnection }) => {
  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert(
    [{ username: 'Account', password: 'Pass' }],
    dbConnection,
  )

  await Promise.all(
    [getTestGenre({ name: 'A' }), getTestGenre({ name: 'B' }), getTestGenre({ name: 'C' })].map(
      (genre) => createGenre(genre, account.id, dbConnection),
    ),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ sort: { field: 'id', order: 'desc' } })

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'C' }),
    expect.objectContaining({ name: 'B' }),
    expect.objectContaining({ name: 'A' }),
  ])
})

test('should sort by id by default', async ({ dbConnection }) => {
  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert(
    [{ username: 'Account', password: 'Pass' }],
    dbConnection,
  )

  await Promise.all(
    [getTestGenre({ name: 'A' }), getTestGenre({ name: 'B' }), getTestGenre({ name: 'C' })].map(
      (genre) => createGenre(genre, account.id, dbConnection),
    ),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({})

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'A' }),
    expect.objectContaining({ name: 'B' }),
    expect.objectContaining({ name: 'C' }),
  ])
})

test('should allow sorting by name', async ({ dbConnection }) => {
  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert(
    [{ username: 'Account', password: 'Pass' }],
    dbConnection,
  )

  await Promise.all(
    [getTestGenre({ name: 'C' }), getTestGenre({ name: 'B' }), getTestGenre({ name: 'A' })].map(
      (genre) => createGenre(genre, account.id, dbConnection),
    ),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ sort: { field: 'name' } })

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'A' }),
    expect.objectContaining({ name: 'B' }),
    expect.objectContaining({ name: 'C' }),
  ])
})

test('should allow sorting by name in ascending order', async ({ dbConnection }) => {
  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert(
    [{ username: 'Account', password: 'Pass' }],
    dbConnection,
  )

  await Promise.all(
    [getTestGenre({ name: 'C' }), getTestGenre({ name: 'B' }), getTestGenre({ name: 'A' })].map(
      (genre) => createGenre(genre, account.id, dbConnection),
    ),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ sort: { field: 'name', order: 'asc' } })

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'A' }),
    expect.objectContaining({ name: 'B' }),
    expect.objectContaining({ name: 'C' }),
  ])
})

test('should allow sorting by name in descending order', async ({ dbConnection }) => {
  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert(
    [{ username: 'Account', password: 'Pass' }],
    dbConnection,
  )

  await Promise.all(
    [getTestGenre({ name: 'A' }), getTestGenre({ name: 'B' }), getTestGenre({ name: 'C' })].map(
      (genre) => createGenre(genre, account.id, dbConnection),
    ),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ sort: { field: 'name', order: 'desc' } })

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'C' }),
    expect.objectContaining({ name: 'B' }),
    expect.objectContaining({ name: 'A' }),
  ])
})

test('should allow sorting by subtitle', async ({ dbConnection }) => {
  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert(
    [{ username: 'Account', password: 'Pass' }],
    dbConnection,
  )

  await Promise.all(
    [
      getTestGenre({ name: 'C', subtitle: 'B' }),
      getTestGenre({ name: 'A' }),
      getTestGenre({ name: 'B', subtitle: 'A' }),
    ].map((genre) => createGenre(genre, account.id, dbConnection)),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ sort: { field: 'subtitle' } })

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'B' }),
    expect.objectContaining({ name: 'C' }),
    expect.objectContaining({ name: 'A' }),
  ])
})

test('should allow sorting by subtitle in ascending order', async ({ dbConnection }) => {
  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert(
    [{ username: 'Account', password: 'Pass' }],
    dbConnection,
  )

  await Promise.all(
    [
      getTestGenre({ name: 'C', subtitle: 'B' }),
      getTestGenre({ name: 'A' }),
      getTestGenre({ name: 'B', subtitle: 'A' }),
    ].map((genre) => createGenre(genre, account.id, dbConnection)),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ sort: { field: 'subtitle', order: 'asc' } })

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'B' }),
    expect.objectContaining({ name: 'C' }),
    expect.objectContaining({ name: 'A' }),
  ])
})

test('should allow sorting by subtitle in descending order', async ({ dbConnection }) => {
  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert(
    [{ username: 'Account', password: 'Pass' }],
    dbConnection,
  )

  await Promise.all(
    [
      getTestGenre({ name: 'C', subtitle: 'B' }),
      getTestGenre({ name: 'A' }),
      getTestGenre({ name: 'B', subtitle: 'A' }),
    ].map((genre) => createGenre(genre, account.id, dbConnection)),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ sort: { field: 'subtitle', order: 'desc' } })

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'A' }),
    expect.objectContaining({ name: 'C' }),
    expect.objectContaining({ name: 'B' }),
  ])
})

test('should allow sorting by type', async ({ dbConnection }) => {
  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert(
    [{ username: 'Account', password: 'Pass' }],
    dbConnection,
  )

  await Promise.all(
    [
      getTestGenre({ name: 'C', type: 'META' }),
      getTestGenre({ name: 'A' }),
      getTestGenre({ name: 'B', type: 'SCENE' }),
    ].map((genre) => createGenre(genre, account.id, dbConnection)),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ sort: { field: 'type' } })

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'B' }),
    expect.objectContaining({ name: 'A' }),
    expect.objectContaining({ name: 'C' }),
  ])
})

test('should allow sorting by type in ascending order', async ({ dbConnection }) => {
  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert(
    [{ username: 'Account', password: 'Pass' }],
    dbConnection,
  )

  await Promise.all(
    [
      getTestGenre({ name: 'C', type: 'META' }),
      getTestGenre({ name: 'A' }),
      getTestGenre({ name: 'B', type: 'SCENE' }),
    ].map((genre) => createGenre(genre, account.id, dbConnection)),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ sort: { field: 'type', order: 'asc' } })

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'B' }),
    expect.objectContaining({ name: 'A' }),
    expect.objectContaining({ name: 'C' }),
  ])
})

test('should allow sorting by type in descending order', async ({ dbConnection }) => {
  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert(
    [{ username: 'Account', password: 'Pass' }],
    dbConnection,
  )

  await Promise.all(
    [
      getTestGenre({ name: 'C', type: 'META' }),
      getTestGenre({ name: 'A' }),
      getTestGenre({ name: 'B', type: 'SCENE' }),
    ].map((genre) => createGenre(genre, account.id, dbConnection)),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ sort: { field: 'type', order: 'desc' } })

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'C' }),
    expect.objectContaining({ name: 'A' }),
    expect.objectContaining({ name: 'B' }),
  ])
})

test('should allow sorting by relevance', async ({ dbConnection }) => {
  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert(
    [{ username: 'Account', password: 'Pass' }],
    dbConnection,
  )

  await Promise.all(
    [
      getTestGenre({ name: 'C', relevance: 2 }),
      getTestGenre({ name: 'A' }),
      getTestGenre({ name: 'B', relevance: 1 }),
    ].map((genre) => createGenre(genre, account.id, dbConnection)),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ sort: { field: 'relevance' } })

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'B' }),
    expect.objectContaining({ name: 'C' }),
    expect.objectContaining({ name: 'A' }),
  ])
})

test('should allow sorting by relevance in ascending order', async ({ dbConnection }) => {
  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert(
    [{ username: 'Account', password: 'Pass' }],
    dbConnection,
  )

  await Promise.all(
    [
      getTestGenre({ name: 'C', relevance: 2 }),
      getTestGenre({ name: 'A' }),
      getTestGenre({ name: 'B', relevance: 1 }),
    ].map((genre) => createGenre(genre, account.id, dbConnection)),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ sort: { field: 'relevance', order: 'asc' } })

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'B' }),
    expect.objectContaining({ name: 'C' }),
    expect.objectContaining({ name: 'A' }),
  ])
})

test('should allow sorting by relevance in descending order', async ({ dbConnection }) => {
  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert(
    [{ username: 'Account', password: 'Pass' }],
    dbConnection,
  )

  await Promise.all(
    [
      getTestGenre({ name: 'C', relevance: 2 }),
      getTestGenre({ name: 'A' }),
      getTestGenre({ name: 'B', relevance: 1 }),
    ].map((genre) => createGenre(genre, account.id, dbConnection)),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ sort: { field: 'relevance', order: 'desc' } })

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'A' }),
    expect.objectContaining({ name: 'C' }),
    expect.objectContaining({ name: 'B' }),
  ])
})

test('should allow sorting by NSFW', async ({ dbConnection }) => {
  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert(
    [{ username: 'Account', password: 'Pass' }],
    dbConnection,
  )

  await Promise.all(
    [
      getTestGenre({ name: 'C', nsfw: true }),
      getTestGenre({ name: 'A' }),
      getTestGenre({ name: 'B', nsfw: false }),
    ].map((genre) => createGenre(genre, account.id, dbConnection)),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ sort: { field: 'nsfw' } })

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'A' }),
    expect.objectContaining({ name: 'B' }),
    expect.objectContaining({ name: 'C' }),
  ])
})

test('should allow sorting by NSFW in ascending order', async ({ dbConnection }) => {
  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert(
    [{ username: 'Account', password: 'Pass' }],
    dbConnection,
  )

  await Promise.all(
    [
      getTestGenre({ name: 'C', nsfw: true }),
      getTestGenre({ name: 'A' }),
      getTestGenre({ name: 'B', nsfw: false }),
    ].map((genre) => createGenre(genre, account.id, dbConnection)),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ sort: { field: 'nsfw', order: 'asc' } })

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'A' }),
    expect.objectContaining({ name: 'B' }),
    expect.objectContaining({ name: 'C' }),
  ])
})

test('should allow sorting by NSFW in descending order', async ({ dbConnection }) => {
  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert(
    [{ username: 'Account', password: 'Pass' }],
    dbConnection,
  )

  await Promise.all(
    [
      getTestGenre({ name: 'C', nsfw: true }),
      getTestGenre({ name: 'A' }),
      getTestGenre({ name: 'B', nsfw: false }),
    ].map((genre) => createGenre(genre, account.id, dbConnection)),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ sort: { field: 'nsfw', order: 'desc' } })

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'C' }),
    expect.objectContaining({ name: 'A' }),
    expect.objectContaining({ name: 'B' }),
  ])
})

test('should allow sorting by shortDescription', async ({ dbConnection }) => {
  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert(
    [{ username: 'Account', password: 'Pass' }],
    dbConnection,
  )

  await Promise.all(
    [
      getTestGenre({ name: 'C', shortDescription: 'B' }),
      getTestGenre({ name: 'A' }),
      getTestGenre({ name: 'B', shortDescription: 'A' }),
    ].map((genre) => createGenre(genre, account.id, dbConnection)),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ sort: { field: 'shortDescription' } })

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'B' }),
    expect.objectContaining({ name: 'C' }),
    expect.objectContaining({ name: 'A' }),
  ])
})

test('should allow sorting by shortDescription in ascending order', async ({ dbConnection }) => {
  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert(
    [{ username: 'Account', password: 'Pass' }],
    dbConnection,
  )

  await Promise.all(
    [
      getTestGenre({ name: 'C', shortDescription: 'B' }),
      getTestGenre({ name: 'A' }),
      getTestGenre({ name: 'B', shortDescription: 'A' }),
    ].map((genre) => createGenre(genre, account.id, dbConnection)),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ sort: { field: 'shortDescription', order: 'asc' } })

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'B' }),
    expect.objectContaining({ name: 'C' }),
    expect.objectContaining({ name: 'A' }),
  ])
})

test('should allow sorting by shortDescription in descending order', async ({ dbConnection }) => {
  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert(
    [{ username: 'Account', password: 'Pass' }],
    dbConnection,
  )

  await Promise.all(
    [
      getTestGenre({ name: 'C', shortDescription: 'B' }),
      getTestGenre({ name: 'A' }),
      getTestGenre({ name: 'B', shortDescription: 'A' }),
    ].map((genre) => createGenre(genre, account.id, dbConnection)),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ sort: { field: 'shortDescription', order: 'desc' } })

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'A' }),
    expect.objectContaining({ name: 'C' }),
    expect.objectContaining({ name: 'B' }),
  ])
})

test('should allow sorting by longDescription', async ({ dbConnection }) => {
  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert(
    [{ username: 'Account', password: 'Pass' }],
    dbConnection,
  )

  await Promise.all(
    [
      getTestGenre({ name: 'C', longDescription: 'B' }),
      getTestGenre({ name: 'A' }),
      getTestGenre({ name: 'B', longDescription: 'A' }),
    ].map((genre) => createGenre(genre, account.id, dbConnection)),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ sort: { field: 'longDescription' } })

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'B' }),
    expect.objectContaining({ name: 'C' }),
    expect.objectContaining({ name: 'A' }),
  ])
})

test('should allow sorting by longDescription in ascending order', async ({ dbConnection }) => {
  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert(
    [{ username: 'Account', password: 'Pass' }],
    dbConnection,
  )

  await Promise.all(
    [
      getTestGenre({ name: 'C', longDescription: 'B' }),
      getTestGenre({ name: 'A' }),
      getTestGenre({ name: 'B', longDescription: 'A' }),
    ].map((genre) => createGenre(genre, account.id, dbConnection)),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ sort: { field: 'longDescription', order: 'asc' } })

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'B' }),
    expect.objectContaining({ name: 'C' }),
    expect.objectContaining({ name: 'A' }),
  ])
})

test('should allow sorting by longDescription in descending order', async ({ dbConnection }) => {
  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert(
    [{ username: 'Account', password: 'Pass' }],
    dbConnection,
  )

  await Promise.all(
    [
      getTestGenre({ name: 'C', longDescription: 'B' }),
      getTestGenre({ name: 'A' }),
      getTestGenre({ name: 'B', longDescription: 'A' }),
    ].map((genre) => createGenre(genre, account.id, dbConnection)),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ sort: { field: 'longDescription', order: 'desc' } })

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'A' }),
    expect.objectContaining({ name: 'C' }),
    expect.objectContaining({ name: 'B' }),
  ])
})

test('should allow sorting by notes', async ({ dbConnection }) => {
  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert(
    [{ username: 'Account', password: 'Pass' }],
    dbConnection,
  )

  await Promise.all(
    [
      getTestGenre({ name: 'C', notes: 'B' }),
      getTestGenre({ name: 'A' }),
      getTestGenre({ name: 'B', notes: 'A' }),
    ].map((genre) => createGenre(genre, account.id, dbConnection)),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ sort: { field: 'notes' } })

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'B' }),
    expect.objectContaining({ name: 'C' }),
    expect.objectContaining({ name: 'A' }),
  ])
})

test('should allow sorting by notes in ascending order', async ({ dbConnection }) => {
  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert(
    [{ username: 'Account', password: 'Pass' }],
    dbConnection,
  )

  await Promise.all(
    [
      getTestGenre({ name: 'C', notes: 'B' }),
      getTestGenre({ name: 'A' }),
      getTestGenre({ name: 'B', notes: 'A' }),
    ].map((genre) => createGenre(genre, account.id, dbConnection)),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ sort: { field: 'notes', order: 'asc' } })

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'B' }),
    expect.objectContaining({ name: 'C' }),
    expect.objectContaining({ name: 'A' }),
  ])
})

test('should allow sorting by notes in descending order', async ({ dbConnection }) => {
  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert(
    [{ username: 'Account', password: 'Pass' }],
    dbConnection,
  )

  await Promise.all(
    [
      getTestGenre({ name: 'C', notes: 'B' }),
      getTestGenre({ name: 'A' }),
      getTestGenre({ name: 'B', notes: 'A' }),
    ].map((genre) => createGenre(genre, account.id, dbConnection)),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ sort: { field: 'notes', order: 'desc' } })

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'A' }),
    expect.objectContaining({ name: 'C' }),
    expect.objectContaining({ name: 'B' }),
  ])
})

test('should allow sorting by createdAt', async ({ dbConnection }) => {
  const date1 = new Date()
  const date2 = new Date(date1.getTime() + 1000)
  const date3 = new Date(date2.getTime() + 1000)

  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert(
    [{ username: 'Account', password: 'Pass' }],
    dbConnection,
  )

  await Promise.all(
    [
      getTestGenre({ name: 'C', createdAt: date3 }),
      getTestGenre({ name: 'A', createdAt: date1 }),
      getTestGenre({ name: 'B', createdAt: date2 }),
    ].map((genre) => createGenre(genre, account.id, dbConnection)),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ sort: { field: 'createdAt' } })

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'A' }),
    expect.objectContaining({ name: 'B' }),
    expect.objectContaining({ name: 'C' }),
  ])
})

test('should allow sorting by createdAt in ascending order', async ({ dbConnection }) => {
  const date1 = new Date()
  const date2 = new Date(date1.getTime() + 1000)
  const date3 = new Date(date2.getTime() + 1000)

  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert(
    [{ username: 'Account', password: 'Pass' }],
    dbConnection,
  )

  await Promise.all(
    [
      getTestGenre({ name: 'C', createdAt: date3 }),
      getTestGenre({ name: 'A', createdAt: date1 }),
      getTestGenre({ name: 'B', createdAt: date2 }),
    ].map((genre) => createGenre(genre, account.id, dbConnection)),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ sort: { field: 'createdAt', order: 'asc' } })

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'A' }),
    expect.objectContaining({ name: 'B' }),
    expect.objectContaining({ name: 'C' }),
  ])
})

test('should allow sorting by createdAt in descending order', async ({ dbConnection }) => {
  const date1 = new Date()
  const date2 = new Date(date1.getTime() + 1000)
  const date3 = new Date(date2.getTime() + 1000)

  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert(
    [{ username: 'Account', password: 'Pass' }],
    dbConnection,
  )

  await Promise.all(
    [
      getTestGenre({ name: 'C', createdAt: date3 }),
      getTestGenre({ name: 'A', createdAt: date1 }),
      getTestGenre({ name: 'B', createdAt: date2 }),
    ].map((genre) => createGenre(genre, account.id, dbConnection)),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ sort: { field: 'createdAt', order: 'desc' } })

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'C' }),
    expect.objectContaining({ name: 'B' }),
    expect.objectContaining({ name: 'A' }),
  ])
})

test('should allow sorting by updatedAt', async ({ dbConnection }) => {
  const date1 = new Date()
  const date2 = new Date(date1.getTime() + 1000)
  const date3 = new Date(date2.getTime() + 1000)

  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert(
    [{ username: 'Account', password: 'Pass' }],
    dbConnection,
  )

  await Promise.all(
    [
      getTestGenre({ name: 'C', updatedAt: date3 }),
      getTestGenre({ name: 'A', updatedAt: date1 }),
      getTestGenre({ name: 'B', updatedAt: date2 }),
    ].map((genre) => createGenre(genre, account.id, dbConnection)),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ sort: { field: 'updatedAt' } })

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'A' }),
    expect.objectContaining({ name: 'B' }),
    expect.objectContaining({ name: 'C' }),
  ])
})

test('should allow sorting by updatedAt in ascending order', async ({ dbConnection }) => {
  const date1 = new Date()
  const date2 = new Date(date1.getTime() + 1000)
  const date3 = new Date(date2.getTime() + 1000)

  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert(
    [{ username: 'Account', password: 'Pass' }],
    dbConnection,
  )

  await Promise.all(
    [
      getTestGenre({ name: 'C', updatedAt: date3 }),
      getTestGenre({ name: 'A', updatedAt: date1 }),
      getTestGenre({ name: 'B', updatedAt: date2 }),
    ].map((genre) => createGenre(genre, account.id, dbConnection)),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ sort: { field: 'updatedAt', order: 'asc' } })

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'A' }),
    expect.objectContaining({ name: 'B' }),
    expect.objectContaining({ name: 'C' }),
  ])
})

test('should allow sorting by updatedAt in descending order', async ({ dbConnection }) => {
  const date1 = new Date()
  const date2 = new Date(date1.getTime() + 1000)
  const date3 = new Date(date2.getTime() + 1000)

  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert(
    [{ username: 'Account', password: 'Pass' }],
    dbConnection,
  )

  await Promise.all(
    [
      getTestGenre({ name: 'C', updatedAt: date3 }),
      getTestGenre({ name: 'A', updatedAt: date1 }),
      getTestGenre({ name: 'B', updatedAt: date2 }),
    ].map((genre) => createGenre(genre, account.id, dbConnection)),
  )

  const query = new GetAllGenresQuery(dbConnection)
  const result = await query.execute({ sort: { field: 'updatedAt', order: 'desc' } })

  expect(result.data).toEqual([
    expect.objectContaining({ name: 'C' }),
    expect.objectContaining({ name: 'B' }),
    expect.objectContaining({ name: 'A' }),
  ])
})
