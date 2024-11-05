import { expect } from 'vitest'

import { AccountsDatabase } from '$lib/server/db/controllers/accounts'
import { GenreHistoryDatabase } from '$lib/server/db/controllers/genre-history'
import {
  GenreCycleError,
  NotFoundError,
  NoUpdatesError,
  SelfInfluenceError,
  UpdateGenreCommand,
} from '$lib/server/features/genres/commands/application/commands/update-genre'
import { UNSET_GENRE_RELEVANCE } from '$lib/types/genres'

import { test } from '../../../../../../../vitest-setup'
import { GetAllGenresQuery } from '../../../queries/application/get-all-genres'
import type { GenreConstructorParams, GenreUpdate } from '../../domain/genre'
import { DrizzleGenreRelevanceVoteRepository } from '../../infrastructure/drizzle-genre-relevance-vote-repository'
import { DrizzleGenreRepository } from '../../infrastructure/genre/drizzle-genre-repository'
import { DrizzleGenreHistoryRepository } from '../../infrastructure/genre-history/drizzle-genre-history-repository'
import { CreateGenreCommand } from './create-genre'
import { VoteGenreRelevanceCommand } from './vote-genre-relevance'

function getTestGenre(data?: Partial<GenreConstructorParams>): GenreConstructorParams {
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
  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  const createGenreCommand = new CreateGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
    new VoteGenreRelevanceCommand(new DrizzleGenreRelevanceVoteRepository(dbConnection)),
  )
  const genre = await createGenreCommand.execute(getTestGenre(), account.id)

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
  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  const pastDate = new Date('2000-01-01')

  const createGenreCommand = new CreateGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
    new VoteGenreRelevanceCommand(new DrizzleGenreRelevanceVoteRepository(dbConnection)),
  )
  const genre = await createGenreCommand.execute(
    getTestGenre({ createdAt: pastDate, updatedAt: pastDate }),
    account.id,
  )

  const beforeExecute = new Date()
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
  const afterExecute = new Date()

  const genreHistoryDb = new GenreHistoryDatabase()
  const genreHistory = await genreHistoryDb.findByGenreId(genre.id, dbConnection)

  expect(genreHistory).toHaveLength(2)
  expect(genreHistory[1]).toEqual(
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

  expect(genreHistory[1].createdAt.getTime()).toBeGreaterThanOrEqual(beforeExecute.getTime())
  expect(genreHistory[1].createdAt.getTime()).toBeLessThanOrEqual(afterExecute.getTime())
  expect(genreHistory[1].createdAt).not.toEqual(pastDate)
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
  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  const createGenreCommand = new CreateGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
    new VoteGenreRelevanceCommand(new DrizzleGenreRelevanceVoteRepository(dbConnection)),
  )
  const genre = await createGenreCommand.execute(getTestGenre(), account.id)

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
  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  const createGenreCommand = new CreateGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
    new VoteGenreRelevanceCommand(new DrizzleGenreRelevanceVoteRepository(dbConnection)),
  )
  const parent = await createGenreCommand.execute(getTestGenre({ name: 'Parent' }), account.id)
  const child = await createGenreCommand.execute(
    getTestGenre({ name: 'Child', parents: new Set([parent.id]) }),
    account.id,
  )

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
  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  const createGenreCommand = new CreateGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
    new VoteGenreRelevanceCommand(new DrizzleGenreRelevanceVoteRepository(dbConnection)),
  )
  const parent = await createGenreCommand.execute(getTestGenre({ name: 'Parent' }), account.id)
  const child = await createGenreCommand.execute(
    getTestGenre({ name: 'Child', parents: new Set([parent.id]) }),
    account.id,
  )
  const grandchild = await createGenreCommand.execute(
    getTestGenre({ name: 'Grandchild', parents: new Set([child.id]) }),
    account.id,
  )

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
  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  const createGenreCommand = new CreateGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
    new VoteGenreRelevanceCommand(new DrizzleGenreRelevanceVoteRepository(dbConnection)),
  )
  const genre = await createGenreCommand.execute(getTestGenre(), account.id)

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
  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  const createGenreCommand = new CreateGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
    new VoteGenreRelevanceCommand(new DrizzleGenreRelevanceVoteRepository(dbConnection)),
  )
  const genre = await createGenreCommand.execute(getTestGenre(), account.id)

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
  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  const createGenreCommand = new CreateGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
    new VoteGenreRelevanceCommand(new DrizzleGenreRelevanceVoteRepository(dbConnection)),
  )
  const genre = await createGenreCommand.execute(getTestGenre(), account.id)

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
