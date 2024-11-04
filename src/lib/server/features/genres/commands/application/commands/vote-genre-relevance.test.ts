import { expect } from 'vitest'

import { AccountsDatabase } from '$lib/server/db/controllers/accounts'
import { type ExtendedInsertGenre, GenresDatabase } from '$lib/server/db/controllers/genre'
import { GenreRelevanceVotesDatabase } from '$lib/server/db/controllers/genre-relevance-votes'
import { UNSET_GENRE_RELEVANCE } from '$lib/types/genres'

import { test } from '../../../../../../../vitest-setup'
import { DrizzleGenreRelevanceVoteRepository } from '../../infrastructure/drizzle-genre-relevance-vote-repository'
import { VoteGenreRelevanceCommand } from './vote-genre-relevance'

function getTestGenre(data?: Partial<ExtendedInsertGenre>): ExtendedInsertGenre {
  return { name: 'Test', akas: [], parents: [], influencedBy: [], updatedAt: new Date(), ...data }
}

test('should delete vote and update relevance when relevance is UNSET_GENRE_RELEVANCE', async ({
  dbConnection,
}) => {
  const genresDb = new GenresDatabase()
  const [genre] = await genresDb.insert([getTestGenre({ relevance: 1 })], dbConnection)

  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  const relevanceVotesDb = new GenreRelevanceVotesDatabase()
  await relevanceVotesDb.upsert(
    { genreId: genre.id, accountId: account.id, relevance: 1, updatedAt: new Date() },
    dbConnection,
  )

  const voteGenreRelevance = new VoteGenreRelevanceCommand(
    new DrizzleGenreRelevanceVoteRepository(dbConnection),
  )

  await voteGenreRelevance.execute(genre.id, UNSET_GENRE_RELEVANCE, account.id)

  const relevanceVotes = await relevanceVotesDb.findByGenreId(genre.id, dbConnection)
  expect(relevanceVotes).toHaveLength(0)

  const updatedGenre = await genresDb.findByIdDetail(genre.id, dbConnection)
  expect(updatedGenre?.relevance).toBe(UNSET_GENRE_RELEVANCE)
})

test('should upsert vote and update relevance when relevance is not UNSET_GENRE_RELEVANCE', async ({
  dbConnection,
}) => {
  const genresDb = new GenresDatabase()
  const [genre] = await genresDb.insert([getTestGenre({ relevance: 1 })], dbConnection)

  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  const relevanceVotesDb = new GenreRelevanceVotesDatabase()
  await relevanceVotesDb.upsert(
    { genreId: genre.id, accountId: account.id, relevance: 1, updatedAt: new Date() },
    dbConnection,
  )

  const voteGenreRelevance = new VoteGenreRelevanceCommand(
    new DrizzleGenreRelevanceVoteRepository(dbConnection),
  )

  await voteGenreRelevance.execute(genre.id, 2, account.id)

  const relevanceVotes = await relevanceVotesDb.findByGenreId(genre.id, dbConnection)
  expect(relevanceVotes).toEqual([
    expect.objectContaining({ genreId: genre.id, accountId: account.id, relevance: 2 }),
  ])

  const updatedGenre = await genresDb.findByIdDetail(genre.id, dbConnection)
  expect(updatedGenre?.relevance).toBe(2)
})

test('should calculate median relevance correctly', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  const [genre] = await genresDb.insert([getTestGenre()], dbConnection)

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

  const voteGenreRelevance = new VoteGenreRelevanceCommand(
    new DrizzleGenreRelevanceVoteRepository(dbConnection),
  )

  await voteGenreRelevance.execute(genre.id, 1, accounts[0].id)
  await voteGenreRelevance.execute(genre.id, 2, accounts[1].id)
  await voteGenreRelevance.execute(genre.id, 3, accounts[2].id)
  await voteGenreRelevance.execute(genre.id, 4, accounts[3].id)
  await voteGenreRelevance.execute(genre.id, 5, accounts[4].id)

  const updatedGenre = await genresDb.findByIdDetail(genre.id, dbConnection)
  expect(updatedGenre?.relevance).toBe(3)
})

test('should round median relevance to nearest integer', async ({ dbConnection }) => {
  const genresDb = new GenresDatabase()
  const [genre] = await genresDb.insert([getTestGenre()], dbConnection)

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

  const voteGenreRelevance = new VoteGenreRelevanceCommand(
    new DrizzleGenreRelevanceVoteRepository(dbConnection),
  )

  await voteGenreRelevance.execute(genre.id, 1, accounts[0].id)
  await voteGenreRelevance.execute(genre.id, 2, accounts[1].id)
  await voteGenreRelevance.execute(genre.id, 3, accounts[2].id)
  await voteGenreRelevance.execute(genre.id, 4, accounts[3].id)

  const updatedGenre = await genresDb.findByIdDetail(genre.id, dbConnection)
  expect(updatedGenre?.relevance).toBe(3)
})
