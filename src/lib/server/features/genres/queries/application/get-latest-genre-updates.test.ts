import { expect } from 'vitest'

import type { IDrizzleConnection } from '$lib/server/db/connection'
import { AccountsDatabase } from '$lib/server/db/controllers/accounts'
import { UNSET_GENRE_RELEVANCE } from '$lib/types/genres'

import { test } from '../../../../../../vitest-setup'
import {
  CreateGenreCommand,
  type CreateGenreInput,
} from '../../commands/application/commands/create-genre'
import { UpdateGenreCommand } from '../../commands/application/commands/update-genre'
import { VoteGenreRelevanceCommand } from '../../commands/application/commands/vote-genre-relevance'
import { DrizzleGenreHistoryRepository } from '../../commands/infrastructure/drizzle-genre-history-repository'
import { DrizzleGenreRelevanceVoteRepository } from '../../commands/infrastructure/drizzle-genre-relevance-vote-repository'
import { DrizzleGenreRepository } from '../../commands/infrastructure/drizzle-genre-repository'
import { DrizzleGenreTreeRepository } from '../../commands/infrastructure/drizzle-genre-tree-repository'
import { GetLatestGenreUpdatesQuery } from './get-latest-genre-updates'

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

test('should return latest history for a created genre', async ({ dbConnection }) => {
  const accountId = new AccountsDatabase()
  const [account] = await accountId.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  const genre = await createGenre(getTestGenre(), account.id, dbConnection)

  const query = new GetLatestGenreUpdatesQuery(dbConnection)
  const result = await query.execute()
  expect(result).toEqual([
    {
      genre: {
        id: expect.any(Number) as number,
        name: 'Test',
        subtitle: null,
        akas: [],
        type: 'STYLE',
        shortDescription: null,
        longDescription: null,
        nsfw: false,
        notes: null,
        parentGenreIds: [],
        derivedFromGenreIds: [],
        influencedByGenreIds: [],
        treeGenreId: genre.id,
        createdAt: expect.any(Date) as Date,
        operation: 'CREATE',
        accountId: account.id,
        account: {
          id: account.id,
          username: account.username,
        },
      },
      previousHistory: undefined,
    },
  ])
})

test('should return latest history for an updated genre', async ({ dbConnection }) => {
  const accountId = new AccountsDatabase()
  const [account] = await accountId.insert([{ username: 'Test', password: 'Test' }], dbConnection)

  const genre = await createGenre(getTestGenre(), account.id, dbConnection)

  const updateGenreCommand = new UpdateGenreCommand(
    new DrizzleGenreRepository(dbConnection),
    new DrizzleGenreTreeRepository(dbConnection),
    new DrizzleGenreHistoryRepository(dbConnection),
  )
  await updateGenreCommand.execute(genre.id, { name: 'Updated' }, account.id)

  const query = new GetLatestGenreUpdatesQuery(dbConnection)
  const result = await query.execute()

  expect(result).toEqual([
    {
      genre: {
        id: expect.any(Number) as number,
        name: 'Updated',
        subtitle: null,
        akas: [],
        type: 'STYLE',
        shortDescription: null,
        longDescription: null,
        nsfw: false,
        notes: null,
        parentGenreIds: [],
        derivedFromGenreIds: [],
        influencedByGenreIds: [],
        treeGenreId: genre.id,
        createdAt: expect.any(Date) as Date,
        operation: 'UPDATE',
        accountId: account.id,
        account: {
          id: account.id,
          username: account.username,
        },
      },
      previousHistory: {
        id: expect.any(Number) as number,
        name: 'Test',
        subtitle: null,
        akas: [],
        type: 'STYLE',
        shortDescription: null,
        longDescription: null,
        nsfw: false,
        notes: null,
        parentGenreIds: [],
        derivedFromGenreIds: [],
        influencedByGenreIds: [],
        treeGenreId: genre.id,
        createdAt: expect.any(Date) as Date,
        operation: 'CREATE',
        accountId: account.id,
      },
    },
    {
      genre: {
        id: expect.any(Number) as number,
        name: 'Test',
        subtitle: null,
        akas: [],
        type: 'STYLE',
        shortDescription: null,
        longDescription: null,
        nsfw: false,
        notes: null,
        parentGenreIds: [],
        derivedFromGenreIds: [],
        influencedByGenreIds: [],
        treeGenreId: genre.id,
        createdAt: expect.any(Date) as Date,
        operation: 'CREATE',
        accountId: account.id,
        account: {
          id: account.id,
          username: account.username,
        },
      },
      previousHistory: undefined,
    },
  ])
})
