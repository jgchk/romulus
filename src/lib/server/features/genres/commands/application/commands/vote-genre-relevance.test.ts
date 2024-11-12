import { expect } from 'vitest'

import type { IDrizzleConnection } from '$lib/server/db/connection'
import { AccountsDatabase } from '$lib/server/db/controllers/accounts'
import { UNSET_GENRE_RELEVANCE } from '$lib/types/genres'

import { test } from '../../../../../../../vitest-setup'
import { GetGenreQuery } from '../../../queries/application/get-genre'
import { GetGenreRelevanceVotesByGenreQuery } from '../../../queries/application/get-genre-relevance-votes-by-genre'
import { DrizzleGenreRelevanceVoteRepository } from '../../infrastructure/drizzle-genre-relevance-vote-repository'
import { DrizzleGenreTreeRepository } from '../../infrastructure/drizzle-genre-tree-repository'
import { DrizzleGenreRepository } from '../../infrastructure/genre/drizzle-genre-repository'
import { DrizzleGenreHistoryRepository } from '../../infrastructure/genre-history/drizzle-genre-history-repository'
import { CreateGenreCommand, type CreateGenreInput } from './create-genre'
import { VoteGenreRelevanceCommand } from './vote-genre-relevance'

async function createGenre(
  data: CreateGenreInput,
  accountId: number,
  dbConnection: IDrizzleConnection,
) {
  const createGenreCommand = new CreateGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreTreeRepository(dbConnection),
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
    derivedFrom: new Set(),
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

  const genre = await createGenre(getTestGenre({ relevance: 1 }), account.id, dbConnection)

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

  const getGenreQuery = new GetGenreQuery(dbConnection)
  const updatedGenre = await getGenreQuery.execute(genre.id)
  expect(updatedGenre?.relevance).toBe(UNSET_GENRE_RELEVANCE)
})

test('should upsert vote and update relevance when relevance is not UNSET_GENRE_RELEVANCE', async ({
  dbConnection,
}) => {
  const accountsDb = new AccountsDatabase()
  const [account] = await accountsDb.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  const genre = await createGenre(getTestGenre({ relevance: 1 }), account.id, dbConnection)

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

  const getGenreQuery = new GetGenreQuery(dbConnection)
  const updatedGenre = await getGenreQuery.execute(genre.id)
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

  const genre = await createGenre(getTestGenre(), accounts[0].id, dbConnection)

  const voteGenreRelevance = new VoteGenreRelevanceCommand(
    new DrizzleGenreRelevanceVoteRepository(dbConnection),
  )

  await voteGenreRelevance.execute(genre.id, 1, accounts[0].id)
  await voteGenreRelevance.execute(genre.id, 2, accounts[1].id)
  await voteGenreRelevance.execute(genre.id, 3, accounts[2].id)
  await voteGenreRelevance.execute(genre.id, 4, accounts[3].id)
  await voteGenreRelevance.execute(genre.id, 5, accounts[4].id)

  const getGenreQuery = new GetGenreQuery(dbConnection)
  const updatedGenre = await getGenreQuery.execute(genre.id)
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

  const genre = await createGenre(getTestGenre(), accounts[0].id, dbConnection)

  const voteGenreRelevance = new VoteGenreRelevanceCommand(
    new DrizzleGenreRelevanceVoteRepository(dbConnection),
  )

  await voteGenreRelevance.execute(genre.id, 1, accounts[0].id)
  await voteGenreRelevance.execute(genre.id, 2, accounts[1].id)
  await voteGenreRelevance.execute(genre.id, 3, accounts[2].id)
  await voteGenreRelevance.execute(genre.id, 4, accounts[3].id)

  const getGenreQuery = new GetGenreQuery(dbConnection)
  const updatedGenre = await getGenreQuery.execute(genre.id)
  expect(updatedGenre?.relevance).toBe(3)
})
