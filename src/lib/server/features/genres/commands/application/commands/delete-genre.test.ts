import { expect } from 'vitest'

import type { IDrizzleConnection } from '$lib/server/db/connection'
import { AccountsDatabase } from '$lib/server/db/controllers/accounts'
import { UNSET_GENRE_RELEVANCE } from '$lib/types/genres'

import { test } from '../../../../../../../vitest-setup'
import { GetAllGenresQuery } from '../../../queries/application/get-all-genres'
import { GetGenreHistoryQuery } from '../../../queries/application/get-genre-history'
import { DrizzleGenreRelevanceVoteRepository } from '../../infrastructure/drizzle-genre-relevance-vote-repository'
import { DrizzleGenreRepository } from '../../infrastructure/genre/drizzle-genre-repository'
import { DrizzleGenreHistoryRepository } from '../../infrastructure/genre-history/drizzle-genre-history-repository'
import { GenreNotFoundError } from '../errors/genre-not-found'
import { CreateGenreCommand, type CreateGenreInput } from './create-genre'
import { DeleteGenreCommand } from './delete-genre'
import { VoteGenreRelevanceCommand } from './vote-genre-relevance'

async function createGenre(
  data: CreateGenreInput,
  accountId: number,
  dbConnection: IDrizzleConnection,
) {
  const createGenreCommand = new CreateGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
    new VoteGenreRelevanceCommand(new DrizzleGenreRelevanceVoteRepository(dbConnection)),
  )

  const genre = await createGenreCommand.execute(data, accountId)

  if (genre instanceof Error) {
    expect.fail(`Failed to create genre: ${genre.message}`)
  }

  return genre
}

function getTestGenre(data?: Partial<CreateGenreInput>): CreateGenreInput {
  return {
    name: 'Test',
    type: 'STYLE',
    nsfw: false,
    parents: new Set(),
    influences: new Set(),
    akas: {
      primary: [],
      secondary: [],
      tertiary: [],
    },
    relevance: UNSET_GENRE_RELEVANCE,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...data,
  }
}

test('should delete the genre', async ({ dbConnection }) => {
  const accountId = new AccountsDatabase()
  const [account] = await accountId.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  const genre = await createGenre(getTestGenre(), account.id, dbConnection)

  const deleteGenreCommand = new DeleteGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
  )

  await deleteGenreCommand.execute(genre.id, account.id)

  const getAllGenresQuery = new GetAllGenresQuery(dbConnection)
  const { data: genres } = await getAllGenresQuery.execute()
  expect(genres).toHaveLength(0)
})

test('should throw NotFoundError if genre not found', async ({ dbConnection }) => {
  const accountId = new AccountsDatabase()
  const [account] = await accountId.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  const deleteGenreCommand = new DeleteGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
  )

  const result = await deleteGenreCommand.execute(0, account.id)

  expect(result).toBeInstanceOf(GenreNotFoundError)
})

test('should create a genre history entry', async ({ dbConnection }) => {
  const accountId = new AccountsDatabase()
  const [account] = await accountId.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  const pastDate = new Date('2000-01-01')
  const genre = await createGenre(
    getTestGenre({ createdAt: pastDate, updatedAt: pastDate }),
    account.id,
    dbConnection,
  )

  const beforeExecute = new Date()
  const deleteGenreCommand = new DeleteGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
  )

  await deleteGenreCommand.execute(genre.id, account.id)
  const afterExecute = new Date()

  const getGenreHistoryQuery = new GetGenreHistoryQuery(dbConnection)
  const genreHistory = await getGenreHistoryQuery.execute(genre.id)
  expect(genreHistory).toHaveLength(2)
  expect(genreHistory[1]).toEqual({
    account: {
      id: account.id,
      username: 'Test',
    },
    accountId: account.id,
    akas: [],
    createdAt: expect.any(Date) as Date,
    id: expect.any(Number) as number,
    influencedByGenreIds: [],
    longDescription: null,
    name: 'Test',
    notes: null,
    nsfw: false,
    operation: 'DELETE',
    parentGenreIds: [],
    shortDescription: null,
    subtitle: null,
    treeGenreId: 1,
    type: 'STYLE',
  })

  expect(genreHistory[1].createdAt.getTime()).toBeGreaterThanOrEqual(beforeExecute.getTime())
  expect(genreHistory[1].createdAt.getTime()).toBeLessThanOrEqual(afterExecute.getTime())
  expect(genreHistory[1].createdAt).not.toEqual(pastDate)
})

test("should move child genres under deleted genre's parents", async ({ dbConnection }) => {
  const accountId = new AccountsDatabase()
  const [account] = await accountId.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  const parent = await createGenre(getTestGenre({ name: 'Parent' }), account.id, dbConnection)
  const child = await createGenre(
    getTestGenre({ name: 'Child', parents: new Set([parent.id]) }),
    account.id,
    dbConnection,
  )
  const grandchild = await createGenre(
    getTestGenre({ name: 'Grandchild', parents: new Set([child.id]) }),
    account.id,
    dbConnection,
  )

  const deleteGenreCommand = new DeleteGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
  )

  await deleteGenreCommand.execute(child.id, account.id)

  const getAllGenresQuery = new GetAllGenresQuery(dbConnection)
  const genres = await getAllGenresQuery.execute({ include: ['parents'] })
  expect(genres.data).toEqual([
    expect.objectContaining({
      id: parent.id,
      name: 'Parent',
      parents: [],
    }),
    expect.objectContaining({
      id: grandchild.id,
      name: 'Grandchild',
      parents: [parent.id],
    }),
  ])
})

test('should create history entries for children that were moved', async ({ dbConnection }) => {
  const accountId = new AccountsDatabase()
  const [account] = await accountId.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  const pastDate = new Date('2000-01-01')

  const parent = await createGenre(
    getTestGenre({ name: 'Parent', createdAt: pastDate, updatedAt: pastDate }),
    account.id,
    dbConnection,
  )
  const child = await createGenre(
    getTestGenre({
      name: 'Child',
      parents: new Set([parent.id]),
      createdAt: pastDate,
      updatedAt: pastDate,
    }),
    account.id,
    dbConnection,
  )
  const grandchild = await createGenre(
    getTestGenre({
      name: 'Grandchild',
      parents: new Set([child.id]),
      createdAt: pastDate,
      updatedAt: pastDate,
    }),
    account.id,
    dbConnection,
  )

  const beforeExecute = new Date()
  const deleteGenreCommand = new DeleteGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
  )

  await deleteGenreCommand.execute(child.id, account.id)
  const afterExecute = new Date()

  const getGenreHistoryQuery = new GetGenreHistoryQuery(dbConnection)
  const parentHistory = await getGenreHistoryQuery.execute(parent.id)
  expect(parentHistory).toHaveLength(1)

  const childHistory = await getGenreHistoryQuery.execute(child.id)
  expect(childHistory).toHaveLength(2)
  expect(childHistory[1]).toEqual({
    account: {
      id: account.id,
      username: 'Test',
    },
    accountId: account.id,
    akas: [],
    createdAt: expect.any(Date) as Date,
    id: expect.any(Number) as number,
    influencedByGenreIds: [],
    longDescription: null,
    name: 'Child',
    notes: null,
    nsfw: false,
    operation: 'DELETE',
    parentGenreIds: [parent.id],
    shortDescription: null,
    subtitle: null,
    treeGenreId: child.id,
    type: 'STYLE',
  })
  expect(childHistory[1].createdAt.getTime()).toBeGreaterThanOrEqual(beforeExecute.getTime())
  expect(childHistory[1].createdAt.getTime()).toBeLessThanOrEqual(afterExecute.getTime())
  expect(childHistory[1].createdAt).not.toEqual(pastDate)

  const grandchildHistory = await getGenreHistoryQuery.execute(grandchild.id)
  expect(grandchildHistory).toHaveLength(2)
  expect(grandchildHistory[1]).toEqual({
    account: {
      id: account.id,
      username: 'Test',
    },
    accountId: account.id,
    akas: [],
    createdAt: expect.any(Date) as Date,
    id: expect.any(Number) as number,
    influencedByGenreIds: [],
    longDescription: null,
    name: 'Grandchild',
    notes: null,
    nsfw: false,
    operation: 'UPDATE',
    parentGenreIds: [parent.id],
    shortDescription: null,
    subtitle: null,
    treeGenreId: grandchild.id,
    type: 'STYLE',
  })
  expect(grandchildHistory[1].createdAt.getTime()).toBeGreaterThanOrEqual(beforeExecute.getTime())
  expect(grandchildHistory[1].createdAt.getTime()).toBeLessThanOrEqual(afterExecute.getTime())
  expect(grandchildHistory[1].createdAt).not.toEqual(pastDate)
})
