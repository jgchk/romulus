import { err } from 'neverthrow'
import { expect } from 'vitest'

import { GenreCycleError } from '../../domain/errors/genre-cycle'
import { SelfInfluenceError } from '../../domain/errors/self-influence'
import type { GenreUpdate } from '../../domain/genre'
import type { IDrizzleConnection } from '../../infrastructure/drizzle-database'
import { DrizzleGenreHistoryRepository } from '../../infrastructure/drizzle-genre-history-repository'
import { DrizzleGenreRepository } from '../../infrastructure/drizzle-genre-repository'
import { DrizzleGenreTreeRepository } from '../../infrastructure/drizzle-genre-tree-repository'
import { MockAuthorizationService } from '../../test/mock-authorization-service'
import { test } from '../../vitest-setup'
import { GenreNotFoundError } from '../errors/genre-not-found'
import { CreateGenreCommand, type CreateGenreInput } from './create-genre'
import { GetAllGenresQuery } from './get-all-genres'
import { GetGenreHistoryQuery } from './get-genre-history'
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

const GENRE_UPDATE: GenreUpdate = Object.freeze({
  name: 'Updated Genre',
  shortDescription: 'Updated short desc',
  longDescription: 'Updated long desc',
  notes: 'Updated notes',
  type: 'META',
  subtitle: 'Updated subtitle',
  nsfw: true,
  parents: new Set([3, 4]),
  influencedBy: new Set([5, 6]),
  relevance: 99,
  primaryAkas: '',
  secondaryAkas: '',
  tertiaryAkas: '',
})

test('should update the genre', async ({ dbConnection }) => {
  const accountId = 1
  const genre = await createGenre(getTestGenre(), accountId, dbConnection)

  const updateGenreCommand = new UpdateGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreTreeRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
    new MockAuthorizationService(),
  )

  const updateResult = await updateGenreCommand.execute(
    genre.id,
    {
      name: 'Updated Genre',
      akas: {
        primary: ['primary-one', 'primary-two'],
        secondary: ['secondary-one', 'secondary-two'],
        tertiary: ['tertiary-one', 'tertiary-two'],
      },
    },
    accountId,
  )
  if (updateResult instanceof Error) {
    expect.fail(`Failed to update genre: ${updateResult.message}`)
  }

  const getAllGenresQuery = new GetAllGenresQuery(dbConnection)
  const {
    data: [updatedGenre],
  } = await getAllGenresQuery.execute({
    filter: { name: 'Updated Genre' },
    include: ['akas'],
  })

  expect(updatedGenre).toEqual(
    expect.objectContaining({
      id: genre.id,
      name: 'Updated Genre',
      akas: {
        primary: ['primary-one', 'primary-two'],
        secondary: ['secondary-one', 'secondary-two'],
        tertiary: ['tertiary-one', 'tertiary-two'],
      },
    }),
  )
})

test('should create a history entry', async ({ dbConnection }) => {
  const pastDate = new Date('2000-01-01')

  const accountId = 1
  const genre = await createGenre(
    getTestGenre({ createdAt: pastDate, updatedAt: pastDate }),
    accountId,
    dbConnection,
  )

  const beforeExecute = new Date()
  const updateGenreCommand = new UpdateGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreTreeRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
    new MockAuthorizationService(),
  )

  const updateResult = await updateGenreCommand.execute(
    genre.id,
    {
      name: 'Updated Genre',
      akas: {
        primary: ['primary-one', 'primary-two'],
        secondary: ['secondary-one', 'secondary-two'],
        tertiary: ['tertiary-one', 'tertiary-two'],
      },
    },
    accountId,
  )
  if (updateResult instanceof Error) {
    expect.fail(`Failed to update genre: ${updateResult.message}`)
  }
  const afterExecute = new Date()

  const getGenreHistoryQuery = new GetGenreHistoryQuery(dbConnection)
  const genreHistory = await getGenreHistoryQuery.execute(genre.id)

  expect(genreHistory).toHaveLength(2)
  expect(genreHistory[1]).toEqual(
    expect.objectContaining({
      accountId,
      operation: 'UPDATE',
      name: 'Updated Genre',
      akas: [
        'primary-one',
        'primary-two',
        'secondary-one',
        'secondary-two',
        'tertiary-one',
        'tertiary-two',
      ],
    }),
  )

  expect(genreHistory[1].createdAt.getTime()).toBeGreaterThanOrEqual(beforeExecute.getTime())
  expect(genreHistory[1].createdAt.getTime()).toBeLessThanOrEqual(afterExecute.getTime())
  expect(genreHistory[1].createdAt).not.toEqual(pastDate)
})

test('should return GenreNotFoundError if genre is not found', async ({ dbConnection }) => {
  const updateGenreCommand = new UpdateGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreTreeRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
    new MockAuthorizationService(),
  )

  const result = await updateGenreCommand.execute(0, GENRE_UPDATE, 1)

  expect(result).toEqual(err(new GenreNotFoundError()))
})

test('should return GenreCycleError if a 1-cycle is detected', async ({ dbConnection }) => {
  const accountId = 1
  const genre = await createGenre(getTestGenre(), accountId, dbConnection)

  const updateGenreCommand = new UpdateGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreTreeRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
    new MockAuthorizationService(),
  )

  const result = await updateGenreCommand.execute(
    genre.id,
    { ...GENRE_UPDATE, parents: new Set([genre.id]) },
    accountId,
  )

  expect(result).toEqual(err(new GenreCycleError('Updated Genre → Updated Genre')))
})

test('should return GenreCycleError if a 2-cycle is detected', async ({ dbConnection }) => {
  const accountId = 1
  const parent = await createGenre(getTestGenre({ name: 'Parent' }), accountId, dbConnection)
  const child = await createGenre(
    getTestGenre({ name: 'Child', parents: new Set([parent.id]) }),
    accountId,
    dbConnection,
  )

  const updateGenreCommand = new UpdateGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreTreeRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
    new MockAuthorizationService(),
  )

  const result = await updateGenreCommand.execute(
    parent.id,
    { ...GENRE_UPDATE, parents: new Set([child.id]) },
    accountId,
  )

  expect(result).toEqual(err(new GenreCycleError('Updated Genre → Child → Updated Genre')))
})

test('should return GenreCycleError if a 3-cycle is detected', async ({ dbConnection }) => {
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

  const updateGenreCommand = new UpdateGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreTreeRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
    new MockAuthorizationService(),
  )

  const result = await updateGenreCommand.execute(
    parent.id,
    { ...GENRE_UPDATE, parents: new Set([grandchild.id]) },
    accountId,
  )

  expect(result).toEqual(
    err(new GenreCycleError('Updated Genre → Grandchild → Child → Updated Genre')),
  )
})

test('should return SelfInfluenceError if genre influences itself', async ({ dbConnection }) => {
  const accountId = 1
  const genre = await createGenre(getTestGenre(), accountId, dbConnection)

  const updateGenreCommand = new UpdateGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreTreeRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
    new MockAuthorizationService(),
  )

  const result = await updateGenreCommand.execute(
    genre.id,
    { ...GENRE_UPDATE, influences: new Set([genre.id]) },
    accountId,
  )

  expect(result).toEqual(err(new SelfInfluenceError()))
})

test('should not create a history entry if no changes are detected', async ({ dbConnection }) => {
  const accountId = 1
  const genre = await createGenre(getTestGenre(), accountId, dbConnection)

  const updateGenreCommand = new UpdateGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreTreeRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
    new MockAuthorizationService(),
  )

  const updateResult = await updateGenreCommand.execute(
    genre.id,
    {
      akas: {
        primary: [],
        secondary: [],
        tertiary: [],
      },
    },
    accountId,
  )
  if (updateResult instanceof Error) {
    expect.fail(`Failed to update genre: ${updateResult.message}`)
  }

  const getGenreHistoryQuery = new GetGenreHistoryQuery(dbConnection)
  const genreHistory = await getGenreHistoryQuery.execute(genre.id)
  expect(genreHistory).toHaveLength(1)
})
