import { expect } from 'vitest'

import type { IDrizzleConnection } from '$lib/server/db/connection'
import { accounts, genreParents, genres } from '$lib/server/db/schema'

import { test } from '../../../../../vitest-setup'
import type { GenreConstructorParams } from '../domain/genre'
import { Genre } from '../domain/genre'
import { GenreHistory } from '../domain/genre-history'
import { DrizzleGenreRepository } from '../infrastructure/genre/drizzle-genre-repository'
import { DrizzleGenreHistoryRepository } from '../infrastructure/genre-history/drizzle-genre-history-repository'
import {
  GenreCycleError,
  GenreService,
  NotFoundError,
  NoUpdatesError,
  SelfInfluenceError,
} from './genre-service'

const createBasicGenre = (id: number, name: string): GenreConstructorParams => ({
  id,
  name,
  type: 'STYLE' as const,
  nsfw: false,
  relevance: 1,
  parents: new Set(),
  influences: new Set(),
  akas: {
    primary: [],
    secondary: [],
    tertiary: [],
  },
  createdAt: new Date(),
  updatedAt: new Date(),
})

const createTestAccount = async (dbConnection: IDrizzleConnection) => {
  const [{ accountId }] = await dbConnection
    .insert(accounts)
    .values([
      {
        username: 'testuser',
        password: 'hashedpassword',
        darkMode: true,
        genreRelevanceFilter: 0,
        showRelevanceTags: false,
        showTypeTags: true,
        showNsfw: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
    .returning({ accountId: accounts.id })
  return accountId
}

test('should update a genre successfully', async ({ dbConnection }) => {
  const genresRepo = new DrizzleGenreRepository(dbConnection)
  const genreHistoryRepo = new DrizzleGenreHistoryRepository(dbConnection)
  const genreService = new GenreService(genresRepo, genreHistoryRepo)

  const accountId = await createTestAccount(dbConnection)

  // Insert a genre
  await dbConnection.insert(genres).values(createBasicGenre(1, 'Original Genre'))

  const genreUpdate = { name: 'Updated Genre' }
  await genreService.updateGenre(1, genreUpdate, accountId) // Using 1 as the accountId of our test account

  const updatedGenre = await genresRepo.findById(1)
  expect(updatedGenre?.name).toBe('Updated Genre')

  const history = await genreHistoryRepo.findLatestByGenreId(1)
  expect(history?.name).toBe('Updated Genre')
  expect(history?.operation).toBe('UPDATE')
})

test('should throw NotFoundError if genre does not exist', async ({ dbConnection }) => {
  const genresRepo = new DrizzleGenreRepository(dbConnection)
  const genreHistoryRepo = new DrizzleGenreHistoryRepository(dbConnection)
  const genreService = new GenreService(genresRepo, genreHistoryRepo)

  const accountId = await createTestAccount(dbConnection)

  await expect(genreService.updateGenre(1, { name: 'New Name' }, accountId)).rejects.toThrow(
    NotFoundError,
  )
})

test('should throw SelfInfluenceError if genre influences itself', async ({ dbConnection }) => {
  const genresRepo = new DrizzleGenreRepository(dbConnection)
  const genreHistoryRepo = new DrizzleGenreHistoryRepository(dbConnection)
  const genreService = new GenreService(genresRepo, genreHistoryRepo)

  const accountId = await createTestAccount(dbConnection)

  // Insert a genre
  await dbConnection.insert(genres).values(createBasicGenre(1, 'Self-influencing Genre'))

  const genreUpdate = { influences: new Set([1]) }
  await expect(genreService.updateGenre(1, genreUpdate, accountId)).rejects.toThrow(
    SelfInfluenceError,
  )
})

test('should throw NoUpdatesError if no changes were made', async ({ dbConnection }) => {
  const genresRepo = new DrizzleGenreRepository(dbConnection)
  const genreHistoryRepo = new DrizzleGenreHistoryRepository(dbConnection)
  const genreService = new GenreService(genresRepo, genreHistoryRepo)

  const accountId = await createTestAccount(dbConnection)

  // Insert a genre
  const genreData = createBasicGenre(1, 'Unchanged Genre')
  await dbConnection.insert(genres).values(genreData)

  // Create an initial history entry
  const genre = new Genre(genreData)
  await genreHistoryRepo.create(GenreHistory.fromGenre(genre, 'CREATE', accountId))

  const genreUpdate = { name: 'Unchanged Genre' }
  await expect(genreService.updateGenre(1, genreUpdate, accountId)).rejects.toThrow(NoUpdatesError)
})

test('should throw GenreCycleError if a cycle is detected', async ({ dbConnection }) => {
  const genresRepo = new DrizzleGenreRepository(dbConnection)
  const genreHistoryRepo = new DrizzleGenreHistoryRepository(dbConnection)
  const genreService = new GenreService(genresRepo, genreHistoryRepo)

  const accountId = await createTestAccount(dbConnection)

  // Insert genres to create a potential cycle
  await dbConnection
    .insert(genres)
    .values([
      createBasicGenre(1, 'Genre A'),
      createBasicGenre(2, 'Genre B'),
      createBasicGenre(3, 'Genre C'),
    ])

  // Set up existing parent relationships
  await dbConnection.insert(genreParents).values([
    { childId: 2, parentId: 1 },
    { childId: 3, parentId: 2 },
  ])

  // Attempt to create a cycle by making Genre A a child of Genre C
  const genreUpdate = { parents: new Set([3]) }
  await expect(genreService.updateGenre(1, genreUpdate, accountId)).rejects.toThrow(GenreCycleError)
})
