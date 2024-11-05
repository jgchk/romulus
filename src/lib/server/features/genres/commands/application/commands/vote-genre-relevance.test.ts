import { expect } from 'vitest'

import { AccountsDatabase } from '$lib/server/db/controllers/accounts'
import { GenresDatabase } from '$lib/server/db/controllers/genre'
import { UNSET_GENRE_RELEVANCE } from '$lib/types/genres'

import { test } from '../../../../../../../vitest-setup'
import { GetGenreRelevanceVotesByGenreQuery } from '../../../queries/application/get-genre-relevance-votes-by-genre'
import type { GenreConstructorParams } from '../../domain/genre'
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

test('should delete vote and update relevance when relevance is UNSET_GENRE_RELEVANCE', async ({
  dbConnection,
}) => {
  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  const createGenreCommand = new CreateGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
    new VoteGenreRelevanceCommand(new DrizzleGenreRelevanceVoteRepository(dbConnection)),
  )
  const genre = await createGenreCommand.execute(getTestGenre({ relevance: 1 }), account.id)

  const voteGenreRelevance = new VoteGenreRelevanceCommand(
    new DrizzleGenreRelevanceVoteRepository(dbConnection),
  )
  const getGenreRelevanceVotesByGenreQuery = new GetGenreRelevanceVotesByGenreQuery(dbConnection)

  await voteGenreRelevance.execute(genre.id, 1, account.id)

  const relevanceVotesBeforeDeletion = await getGenreRelevanceVotesByGenreQuery.execute(genre.id)
  expect(relevanceVotesBeforeDeletion).toHaveLength(1)

  await voteGenreRelevance.execute(genre.id, UNSET_GENRE_RELEVANCE, account.id)

  const relevanceVotesAfterDeletion = await getGenreRelevanceVotesByGenreQuery.execute(genre.id)
  expect(relevanceVotesAfterDeletion).toHaveLength(0)

  const genresDb = new GenresDatabase()
  const updatedGenre = await genresDb.findByIdDetail(genre.id, dbConnection)
  expect(updatedGenre?.relevance).toBe(UNSET_GENRE_RELEVANCE)
})

test('should upsert vote and update relevance when relevance is not UNSET_GENRE_RELEVANCE', async ({
  dbConnection,
}) => {
  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  const createGenreCommand = new CreateGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
    new VoteGenreRelevanceCommand(new DrizzleGenreRelevanceVoteRepository(dbConnection)),
  )
  const genre = await createGenreCommand.execute(getTestGenre({ relevance: 1 }), account.id)

  const voteGenreRelevance = new VoteGenreRelevanceCommand(
    new DrizzleGenreRelevanceVoteRepository(dbConnection),
  )
  const getGenreRelevanceVotesByGenreQuery = new GetGenreRelevanceVotesByGenreQuery(dbConnection)

  await voteGenreRelevance.execute(genre.id, 1, account.id)

  const relevanceVotesBeforeVote = await getGenreRelevanceVotesByGenreQuery.execute(genre.id)
  expect(relevanceVotesBeforeVote).toEqual([
    expect.objectContaining({ genreId: genre.id, accountId: account.id, relevance: 1 }),
  ])

  await voteGenreRelevance.execute(genre.id, 2, account.id)

  const relevanceVotesAfterVote = await getGenreRelevanceVotesByGenreQuery.execute(genre.id)
  expect(relevanceVotesAfterVote).toEqual([
    expect.objectContaining({ genreId: genre.id, accountId: account.id, relevance: 2 }),
  ])

  const genresDb = new GenresDatabase()
  const updatedGenre = await genresDb.findByIdDetail(genre.id, dbConnection)
  expect(updatedGenre?.relevance).toBe(2)
})

test('should calculate median relevance correctly', async ({ dbConnection }) => {
  const accountsDb = new AccountsDatabase()
  const accounts = await accountsDb.insert(
    [
      { username: 'user-1', password: 'user-1' },
      { username: 'user-2', password: 'user-2' },
      { username: 'user-3', password: 'user-3' },
      { username: 'user-4', password: 'user-4' },
      { username: 'user-5', password: 'user-5' },
    ],
    dbConnection,
  )

  const createGenreCommand = new CreateGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
    new VoteGenreRelevanceCommand(new DrizzleGenreRelevanceVoteRepository(dbConnection)),
  )
  const genre = await createGenreCommand.execute(getTestGenre(), accounts[0].id)

  const voteGenreRelevance = new VoteGenreRelevanceCommand(
    new DrizzleGenreRelevanceVoteRepository(dbConnection),
  )

  await voteGenreRelevance.execute(genre.id, 1, accounts[0].id)
  await voteGenreRelevance.execute(genre.id, 2, accounts[1].id)
  await voteGenreRelevance.execute(genre.id, 3, accounts[2].id)
  await voteGenreRelevance.execute(genre.id, 4, accounts[3].id)
  await voteGenreRelevance.execute(genre.id, 5, accounts[4].id)

  const genresDb = new GenresDatabase()
  const updatedGenre = await genresDb.findByIdDetail(genre.id, dbConnection)
  expect(updatedGenre?.relevance).toBe(3)
})

test('should round median relevance to nearest integer', async ({ dbConnection }) => {
  const accountsDb = new AccountsDatabase()
  const accounts = await accountsDb.insert(
    [
      { username: 'user-1', password: 'user-1' },
      { username: 'user-2', password: 'user-2' },
      { username: 'user-3', password: 'user-3' },
      { username: 'user-4', password: 'user-4' },
    ],
    dbConnection,
  )

  const createGenreCommand = new CreateGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
    new VoteGenreRelevanceCommand(new DrizzleGenreRelevanceVoteRepository(dbConnection)),
  )
  const genre = await createGenreCommand.execute(getTestGenre(), accounts[0].id)

  const voteGenreRelevance = new VoteGenreRelevanceCommand(
    new DrizzleGenreRelevanceVoteRepository(dbConnection),
  )

  await voteGenreRelevance.execute(genre.id, 1, accounts[0].id)
  await voteGenreRelevance.execute(genre.id, 2, accounts[1].id)
  await voteGenreRelevance.execute(genre.id, 3, accounts[2].id)
  await voteGenreRelevance.execute(genre.id, 4, accounts[3].id)

  const genresDb = new GenresDatabase()
  const updatedGenre = await genresDb.findByIdDetail(genre.id, dbConnection)
  expect(updatedGenre?.relevance).toBe(3)
})
