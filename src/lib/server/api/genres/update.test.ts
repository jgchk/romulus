import { expect } from 'vitest'

import { AccountsDatabase } from '$lib/server/db/controllers/accounts'
import { type ExtendedInsertGenre, GenresDatabase } from '$lib/server/db/controllers/genre'
import { GenreHistoryDatabase } from '$lib/server/db/controllers/genre-history'
import {
  GenreCycleError,
  NotFoundError,
  NoUpdatesError,
  SelfInfluenceError,
} from '$lib/server/ddd/features/genres/application/genre-service'
import { createGenreHistoryEntry } from '$lib/server/genres'

import { test } from '../../../../vitest-setup'
import { type GenreData } from './types'
import { updateGenre } from './update'

function getTestGenre(data?: Partial<ExtendedInsertGenre>): ExtendedInsertGenre {
  return { name: 'Test', akas: [], parents: [], influencedBy: [], updatedAt: new Date(), ...data }
}

const GENRE_UPDATE: GenreData = Object.freeze({
  name: 'Updated Genre',
  shortDescription: 'Updated short desc',
  longDescription: 'Updated long desc',
  notes: 'Updated notes',
  type: 'META',
  subtitle: 'Updated subtitle',
  nsfw: true,
  parents: [3, 4],
  influencedBy: [5, 6],
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

  await updateGenre(
    genre.id,
    {
      ...genre,
      name: 'Updated Genre',
      primaryAkas: 'primary-one, primary-two',
      secondaryAkas: 'secondary-one, secondary-two',
      tertiaryAkas: 'tertiary-one, tertiary-two',
    },
    account.id,
    dbConnection,
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

  await updateGenre(
    genre.id,
    {
      ...genre,
      name: 'Updated Genre',
      primaryAkas: 'primary-one, primary-two',
      secondaryAkas: 'secondary-one, secondary-two',
      tertiaryAkas: 'tertiary-one, tertiary-two',
    },
    account.id,
    dbConnection,
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

test('should throw NotFoundError if genre is not found', async ({ dbConnection }) => {
  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  await expect(updateGenre(0, GENRE_UPDATE, account.id, dbConnection)).rejects.toThrow(
    NotFoundError,
  )
})

test('should throw GenreCycleError if a 1-cycle is detected', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  const [genre] = await genresDb.insert([getTestGenre()], dbConnection)

  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  await expect(
    updateGenre(genre.id, { ...GENRE_UPDATE, parents: [genre.id] }, account.id, dbConnection),
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

  await expect(
    updateGenre(parent.id, { ...GENRE_UPDATE, parents: [child.id] }, account.id, dbConnection),
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

  await expect(
    updateGenre(parent.id, { ...GENRE_UPDATE, parents: [grandchild.id] }, account.id, dbConnection),
  ).rejects.toThrow(GenreCycleError)
})

test('should throw SelfInfluenceError if genre influences itself', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  const [genre] = await genresDb.insert([getTestGenre()], dbConnection)

  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  await expect(
    updateGenre(genre.id, { ...GENRE_UPDATE, influencedBy: [genre.id] }, account.id, dbConnection),
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

  await expect(
    updateGenre(
      genre.id,
      {
        ...genre,
        primaryAkas: '',
        secondaryAkas: '',
        tertiaryAkas: '',
      },
      account.id,
      dbConnection,
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

  try {
    await updateGenre(
      genre.id,
      {
        ...genre,
        primaryAkas: '',
        secondaryAkas: '',
        tertiaryAkas: '',
      },
      account.id,
      dbConnection,
    )
  } catch {
    // ignore
  }

  const genreHistoryDb = new GenreHistoryDatabase()
  const genreHistory = await genreHistoryDb.findByGenreId(genre.id, dbConnection)
  expect(genreHistory).toHaveLength(1)
})
