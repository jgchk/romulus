import { expect } from 'vitest'

import { AccountsDatabase } from '$lib/server/db/controllers/accounts'
import { type ExtendedInsertGenre, GenresDatabase } from '$lib/server/db/controllers/genre'
import { GenreHistoryDatabase } from '$lib/server/db/controllers/genre-history'
import {
  GenreCycleError,
  NotFoundError,
  NoUpdatesError,
  SelfInfluenceError,
  UpdateGenreCommand,
} from '$lib/server/features/genres/commands/application/commands/update-genre'
import { createGenreHistoryEntry } from '$lib/server/genres'

import { test } from '../../../../../../../vitest-setup'
import type { GenreUpdate } from '../../domain/genre'
import { DrizzleGenreRepository } from '../../infrastructure/genre/drizzle-genre-repository'
import { DrizzleGenreHistoryRepository } from '../../infrastructure/genre-history/drizzle-genre-history-repository'

function getTestGenre(data?: Partial<ExtendedInsertGenre>): ExtendedInsertGenre {
  return { name: 'Test', akas: [], parents: [], influencedBy: [], updatedAt: new Date(), ...data }
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
  const genresDb = new GenresDatabase()
  const [genre] = await genresDb.insert([getTestGenre()], dbConnection)

  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  const updateGenreCommand = new UpdateGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
  )

  await updateGenreCommand.execute(
    genre.id,
    {
      name: 'Updated Genre',
      akas: {
        primary: ['primary-one', 'primary-two'],
        secondary: ['secondary-one', 'secondary-two'],
        tertiary: ['tertiary-one', 'tertiary-two'],
      },
    },
    account.id,
  )

  const {
    results: [updatedGenre],
  } = await genresDb.findAll({ filter: { ids: [genre.id] }, include: ['akas'] }, dbConnection)

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
  const genresDb = new GenresDatabase()
  const [genre] = await genresDb.insert([getTestGenre()], dbConnection)

  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  const updateGenreCommand = new UpdateGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
  )

  await updateGenreCommand.execute(
    genre.id,
    {
      name: 'Updated Genre',
      akas: {
        primary: ['primary-one', 'primary-two'],
        secondary: ['secondary-one', 'secondary-two'],
        tertiary: ['tertiary-one', 'tertiary-two'],
      },
    },
    account.id,
  )

  const genreHistoryDb = new GenreHistoryDatabase()
  const genreHistory = await genreHistoryDb.findByGenreId(genre.id, dbConnection)

  expect(genreHistory).toHaveLength(1)
  expect(genreHistory[0]).toEqual(
    expect.objectContaining({
      accountId: account.id,
      operation: 'UPDATE',
      name: 'Updated Genre',
      akas: [
        { name: 'primary-one' },
        { name: 'primary-two' },
        { name: 'secondary-one' },
        { name: 'secondary-two' },
        { name: 'tertiary-one' },
        { name: 'tertiary-two' },
      ],
    }),
  )
})

test('should throw NotFoundError if genre is not found', async ({ dbConnection }) => {
  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  const updateGenreCommand = new UpdateGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
  )

  await expect(updateGenreCommand.execute(0, GENRE_UPDATE, account.id)).rejects.toThrow(
    NotFoundError,
  )
})

test('should throw GenreCycleError if a 1-cycle is detected', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  const [genre] = await genresDb.insert([getTestGenre()], dbConnection)

  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  const updateGenreCommand = new UpdateGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
  )

  await expect(
    updateGenreCommand.execute(
      genre.id,
      { ...GENRE_UPDATE, parents: new Set([genre.id]) },
      account.id,
    ),
  ).rejects.toThrow(GenreCycleError)
})

test('should throw GenreCycleError if a 2-cycle is detected', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  const [parent, child] = await genresDb.insert(
    [getTestGenre({ id: 0, name: 'Parent' }), getTestGenre({ id: 1, name: 'Child', parents: [0] })],
    dbConnection,
  )

  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  const updateGenreCommand = new UpdateGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
  )

  await expect(
    updateGenreCommand.execute(
      parent.id,
      { ...GENRE_UPDATE, parents: new Set([child.id]) },
      account.id,
    ),
  ).rejects.toThrow(GenreCycleError)
})

test('should throw GenreCycleError if a 3-cycle is detected', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  const [parent, , grandchild] = await genresDb.insert(
    [
      getTestGenre({ id: 0, name: 'Parent' }),
      getTestGenre({ id: 1, name: 'Child', parents: [0] }),
      getTestGenre({ id: 2, name: 'Grandchild', parents: [1] }),
    ],
    dbConnection,
  )

  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  const updateGenreCommand = new UpdateGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
  )

  await expect(
    updateGenreCommand.execute(
      parent.id,
      { ...GENRE_UPDATE, parents: new Set([grandchild.id]) },
      account.id,
    ),
  ).rejects.toThrow(GenreCycleError)
})

test('should throw SelfInfluenceError if genre influences itself', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  const [genre] = await genresDb.insert([getTestGenre()], dbConnection)

  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  const updateGenreCommand = new UpdateGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
  )

  await expect(
    updateGenreCommand.execute(
      genre.id,
      { ...GENRE_UPDATE, influences: new Set([genre.id]) },
      account.id,
    ),
  ).rejects.toThrow(SelfInfluenceError)
})

test('should throw NoUpdatesError if no changes are made', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  const [genre] = await genresDb.insert([getTestGenre()], dbConnection)

  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  await createGenreHistoryEntry({
    genre,
    accountId: account.id,
    operation: 'CREATE',
    connection: dbConnection,
  })

  const updateGenreCommand = new UpdateGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
  )

  await expect(
    updateGenreCommand.execute(
      genre.id,
      {
        akas: {
          primary: [],
          secondary: [],
          tertiary: [],
        },
      },
      account.id,
    ),
  ).rejects.toThrow(NoUpdatesError)
})

test('should not create a history entry if no changes are detected', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  const [genre] = await genresDb.insert([getTestGenre()], dbConnection)

  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  await createGenreHistoryEntry({
    genre,
    accountId: account.id,
    operation: 'CREATE',
    connection: dbConnection,
  })

  const updateGenreCommand = new UpdateGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
  )

  try {
    await updateGenreCommand.execute(
      genre.id,
      {
        akas: {
          primary: [],
          secondary: [],
          tertiary: [],
        },
      },
      account.id,
    )
  } catch {
    // ignore
  }

  const genreHistoryDb = new GenreHistoryDatabase()
  const genreHistory = await genreHistoryDb.findByGenreId(genre.id, dbConnection)
  expect(genreHistory).toHaveLength(1)
})
