import { err } from 'neverthrow'
import { expect } from 'vitest'

import { GetAllGenresQuery } from '../../../queries/application/get-all-genres'
import { GetGenreHistoryQuery } from '../../../queries/application/get-genre-history'
import type { IDrizzleConnection } from '../../../shared/infrastructure/drizzle-database'
import { MockAuthorizationClient } from '../../../test/mock-authorization-client'
import { test } from '../../../vitest-setup'
import { DrizzleGenreHistoryRepository } from '../../infrastructure/drizzle-genre-history-repository'
import { DrizzleGenreRepository } from '../../infrastructure/drizzle-genre-repository'
import { DrizzleGenreTreeRepository } from '../../infrastructure/drizzle-genre-tree-repository'
import { GenreNotFoundError } from '../errors/genre-not-found'
import { CreateGenreCommand, type CreateGenreInput } from './create-genre'
import { DeleteGenreCommand } from './delete-genre'

async function createGenre(
  data: CreateGenreInput,
  accountId: number,
  dbConnection: IDrizzleConnection,
) {
  const createGenreCommand = new CreateGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreTreeRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
    new MockAuthorizationClient(),
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

test('should delete the genre', async ({ dbConnection }) => {
  const accountId = 1
  const genre = await createGenre(getTestGenre(), accountId, dbConnection)

  const deleteGenreCommand = new DeleteGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreTreeRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
    new MockAuthorizationClient(),
  )

  const result = await deleteGenreCommand.execute(genre.id, accountId)
  if (result instanceof Error) {
    expect.fail(`Failed to delete genre: ${result.message}`)
  }

  const getAllGenresQuery = new GetAllGenresQuery(dbConnection)
  const { data: genres } = await getAllGenresQuery.execute()
  expect(genres).toHaveLength(0)
})

test('should throw NotFoundError if genre not found', async ({ dbConnection }) => {
  const deleteGenreCommand = new DeleteGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreTreeRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
    new MockAuthorizationClient(),
  )

  const result = await deleteGenreCommand.execute(0, 1)

  expect(result).toEqual(err(new GenreNotFoundError()))
})

test('should create a genre history entry', async ({ dbConnection }) => {
  const pastDate = new Date('2000-01-01')

  const accountId = 1
  const genre = await createGenre(
    getTestGenre({ createdAt: pastDate, updatedAt: pastDate }),
    accountId,
    dbConnection,
  )

  const beforeExecute = new Date()
  const deleteGenreCommand = new DeleteGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreTreeRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
    new MockAuthorizationClient(),
  )

  const result = await deleteGenreCommand.execute(genre.id, accountId)
  if (result instanceof Error) {
    expect.fail(`Failed to delete genre: ${result.message}`)
  }
  const afterExecute = new Date()

  const getGenreHistoryQuery = new GetGenreHistoryQuery(dbConnection)
  const genreHistory = await getGenreHistoryQuery.execute(genre.id)
  expect(genreHistory).toHaveLength(2)
  expect(genreHistory[1]).toEqual({
    id: expect.any(Number) as number,
    accountId,
    akas: [],
    createdAt: expect.any(Date) as Date,
    parentGenreIds: [],
    derivedFromGenreIds: [],
    influencedByGenreIds: [],
    longDescription: null,
    name: 'Test',
    notes: null,
    nsfw: false,
    operation: 'DELETE',
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
  const accountId = 1
  const parent = await createGenre(getTestGenre({ name: 'Parent' }), accountId, dbConnection)
  const child = await createGenre(
    getTestGenre({ name: 'Child', parents: new Set([parent.id]) }),
    accountId,
    dbConnection,
  )
  const grandchild = await createGenre(
    getTestGenre({ name: 'Grandchild', parents: new Set([child.id]) }),
    accountId,
    dbConnection,
  )

  const deleteGenreCommand = new DeleteGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreTreeRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
    new MockAuthorizationClient(),
  )

  const result = await deleteGenreCommand.execute(child.id, accountId)
  if (result instanceof Error) {
    expect.fail(`Failed to delete genre: ${result.message}`)
  }

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
  const pastDate = new Date('2000-01-01')

  const accountId = 1
  const parent = await createGenre(
    getTestGenre({ name: 'Parent', createdAt: pastDate, updatedAt: pastDate }),
    accountId,
    dbConnection,
  )
  const child = await createGenre(
    getTestGenre({
      name: 'Child',
      parents: new Set([parent.id]),
      createdAt: pastDate,
      updatedAt: pastDate,
    }),
    accountId,
    dbConnection,
  )
  const grandchild = await createGenre(
    getTestGenre({
      name: 'Grandchild',
      parents: new Set([child.id]),
      createdAt: pastDate,
      updatedAt: pastDate,
    }),
    accountId,
    dbConnection,
  )

  const beforeExecute = new Date()
  const deleteGenreCommand = new DeleteGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreTreeRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
    new MockAuthorizationClient(),
  )

  const result = await deleteGenreCommand.execute(child.id, accountId)
  if (result instanceof Error) {
    expect.fail(`Failed to delete genre: ${result.message}`)
  }
  const afterExecute = new Date()

  const getGenreHistoryQuery = new GetGenreHistoryQuery(dbConnection)
  const parentHistory = await getGenreHistoryQuery.execute(parent.id)
  expect(parentHistory).toHaveLength(1)

  const childHistory = await getGenreHistoryQuery.execute(child.id)
  expect(childHistory).toHaveLength(2)
  expect(childHistory[1]).toEqual({
    accountId: accountId,
    akas: [],
    createdAt: expect.any(Date) as Date,
    id: expect.any(Number) as number,
    parentGenreIds: [parent.id],
    derivedFromGenreIds: [],
    influencedByGenreIds: [],
    longDescription: null,
    name: 'Child',
    notes: null,
    nsfw: false,
    operation: 'DELETE',
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
    accountId,
    akas: [],
    createdAt: expect.any(Date) as Date,
    id: expect.any(Number) as number,
    parentGenreIds: [parent.id],
    derivedFromGenreIds: [],
    influencedByGenreIds: [],
    longDescription: null,
    name: 'Grandchild',
    notes: null,
    nsfw: false,
    operation: 'UPDATE',
    shortDescription: null,
    subtitle: null,
    treeGenreId: grandchild.id,
    type: 'STYLE',
  })
  expect(grandchildHistory[1].createdAt.getTime()).toBeGreaterThanOrEqual(beforeExecute.getTime())
  expect(grandchildHistory[1].createdAt.getTime()).toBeLessThanOrEqual(afterExecute.getTime())
  expect(grandchildHistory[1].createdAt).not.toEqual(pastDate)
})
