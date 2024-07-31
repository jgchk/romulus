import { describe, expect } from 'vitest'

import { AccountsDatabase } from '$lib/server/db/controllers/accounts'
import { GenresDatabase } from '$lib/server/db/controllers/genre'
import { GenreHistoryDatabase } from '$lib/server/db/controllers/genre-history'
import { GenreRelevanceVotesDatabase } from '$lib/server/db/controllers/genre-relevance-votes'

import { test } from '../../../../vitest-setup'
import { createGenre } from './create'
import type { GenreData } from './types'

describe('createGenre', () => {
  test('should return the created genre id', async ({ dbConnection }) => {
    const genreData: GenreData = {
      name: 'Test',
      subtitle: null,
      type: 'STYLE',
      shortDescription: null,
      longDescription: null,
      notes: null,
      primaryAkas: null,
      secondaryAkas: null,
      tertiaryAkas: null,
      parents: [],
      influencedBy: [],
      relevance: undefined,
      nsfw: false,
    }

    const accountsDb = new AccountsDatabase()
    const [account] = await accountsDb.insert(
      [
        {
          username: 'test-1',
          password: 'test-1',
        },
      ],
      dbConnection,
    )

    const genreId = await createGenre(genreData, account.id, dbConnection)

    expect(genreId).toBeTypeOf('number')
  })

  test('should insert the genre into the database', async ({ dbConnection }) => {
    const genreData: GenreData = {
      name: 'Test',
      subtitle: null,
      type: 'STYLE',
      shortDescription: null,
      longDescription: null,
      notes: null,
      primaryAkas: null,
      secondaryAkas: null,
      tertiaryAkas: null,
      parents: [],
      influencedBy: [],
      relevance: undefined,
      nsfw: false,
    }

    const accountsDb = new AccountsDatabase()
    const [account] = await accountsDb.insert(
      [
        {
          username: 'test-2',
          password: 'test-2',
        },
      ],
      dbConnection,
    )

    const id = await createGenre(genreData, account.id, dbConnection)

    const genresDb = new GenresDatabase()
    const genre = await genresDb.findByIdEdit(id, dbConnection)
    expect(genre).toEqual({
      id: expect.any(Number) as number,
      name: 'Test',
      subtitle: null,
      type: 'STYLE',
      shortDescription: null,
      longDescription: null,
      notes: null,
      parents: [],
      influencedBy: [],
      relevance: 99,
      nsfw: false,
      akas: [],
      createdAt: expect.any(Date) as Date,
      updatedAt: expect.any(Date) as Date,
    })
  })

  test('should map AKAs correctly', async ({ dbConnection }) => {
    const genreData: GenreData = {
      name: 'Test',
      subtitle: null,
      type: 'STYLE',
      shortDescription: null,
      longDescription: null,
      notes: null,
      primaryAkas: 'primary one, primary two',
      secondaryAkas: 'secondary one, secondary two',
      tertiaryAkas: 'tertiary one, tertiary two',
      parents: [],
      influencedBy: [],
      relevance: undefined,
      nsfw: false,
    }

    const accountsDb = new AccountsDatabase()
    const [account] = await accountsDb.insert(
      [
        {
          username: 'test-3',
          password: 'test-3',
        },
      ],
      dbConnection,
    )

    const id = await createGenre(genreData, account.id, dbConnection)

    const genresDb = new GenresDatabase()
    const genre = await genresDb.findByIdEdit(id, dbConnection)
    expect(genre).toEqual({
      id: expect.any(Number) as number,
      name: 'Test',
      subtitle: null,
      type: 'STYLE',
      shortDescription: null,
      longDescription: null,
      notes: null,
      parents: [],
      influencedBy: [],
      relevance: 99,
      nsfw: false,
      akas: [
        { name: 'primary one', relevance: 3, order: 0 },
        { name: 'primary two', relevance: 3, order: 1 },
        { name: 'secondary one', relevance: 2, order: 0 },
        { name: 'secondary two', relevance: 2, order: 1 },
        { name: 'tertiary one', relevance: 1, order: 0 },
        { name: 'tertiary two', relevance: 1, order: 1 },
      ],
      createdAt: expect.any(Date) as Date,
      updatedAt: expect.any(Date) as Date,
    })
  })

  test('should insert a history entry', async ({ dbConnection }) => {
    const genreData: GenreData = {
      name: 'Test',
      subtitle: null,
      type: 'STYLE',
      shortDescription: null,
      longDescription: null,
      notes: null,
      primaryAkas: null,
      secondaryAkas: null,
      tertiaryAkas: null,
      parents: [],
      influencedBy: [],
      relevance: undefined,
      nsfw: false,
    }

    const accountsDb = new AccountsDatabase()
    const [account] = await accountsDb.insert(
      [
        {
          username: 'test-3',
          password: 'test-3',
        },
      ],
      dbConnection,
    )

    const id = await createGenre(genreData, account.id, dbConnection)

    const genreHistoryDb = new GenreHistoryDatabase()
    const genreHistory = await genreHistoryDb.findByGenreId(id, dbConnection)
    expect(genreHistory).toEqual([
      {
        id: expect.any(Number) as number,
        treeGenreId: id,
        name: 'Test',
        subtitle: null,
        type: 'STYLE',
        shortDescription: null,
        longDescription: null,
        notes: null,
        akas: [],
        parentGenreIds: [],
        influencedByGenreIds: [],
        nsfw: false,
        accountId: account.id,
        operation: 'CREATE',
        createdAt: expect.any(Date) as Date,
        account: {
          id: account.id,
          username: 'test-3',
        },
      },
    ])
  })

  test('should insert a relevance vote when relevance is set', async ({ dbConnection }) => {
    const genreData: GenreData = {
      name: 'Test',
      subtitle: null,
      type: 'STYLE',
      shortDescription: null,
      longDescription: null,
      notes: null,
      primaryAkas: null,
      secondaryAkas: null,
      tertiaryAkas: null,
      parents: [],
      influencedBy: [],
      relevance: 1,
      nsfw: false,
    }

    const accountsDb = new AccountsDatabase()
    const [account] = await accountsDb.insert(
      [
        {
          username: 'test-3',
          password: 'test-3',
        },
      ],
      dbConnection,
    )

    const id = await createGenre(genreData, account.id, dbConnection)

    const genreRelevanceVotesDb = new GenreRelevanceVotesDatabase()
    const genreRelevanceVote = await genreRelevanceVotesDb.findByGenreIdAndAccountId(
      id,
      account.id,
      dbConnection,
    )
    expect(genreRelevanceVote).toEqual({
      genreId: id,
      accountId: account.id,
      relevance: 1,
      createdAt: expect.any(Date) as Date,
      updatedAt: expect.any(Date) as Date,
    })

    const genresDb = new GenresDatabase()
    const genre = await genresDb.findByIdEdit(id, dbConnection)
    expect(genre?.relevance).toBe(1)
  })

  test('should not insert a relevance vote when relevance is undefined', async ({
    dbConnection,
  }) => {
    const genreData: GenreData = {
      name: 'Test',
      subtitle: null,
      type: 'STYLE',
      shortDescription: null,
      longDescription: null,
      notes: null,
      primaryAkas: null,
      secondaryAkas: null,
      tertiaryAkas: null,
      parents: [],
      influencedBy: [],
      relevance: undefined,
      nsfw: false,
    }

    const accountsDb = new AccountsDatabase()
    const [account] = await accountsDb.insert(
      [
        {
          username: 'test-3',
          password: 'test-3',
        },
      ],
      dbConnection,
    )

    const id = await createGenre(genreData, account.id, dbConnection)

    const genreRelevanceVotesDb = new GenreRelevanceVotesDatabase()
    const genreRelevanceVote = await genreRelevanceVotesDb.findByGenreIdAndAccountId(
      id,
      account.id,
      dbConnection,
    )
    expect(genreRelevanceVote).toBeUndefined()

    const genresDb = new GenresDatabase()
    const genre = await genresDb.findByIdEdit(id, dbConnection)
    expect(genre?.relevance).toBe(99)
  })

  test('should not insert a relevance vote when relevance is unset', async ({ dbConnection }) => {
    const genreData: GenreData = {
      name: 'Test',
      subtitle: null,
      type: 'STYLE',
      shortDescription: null,
      longDescription: null,
      notes: null,
      primaryAkas: null,
      secondaryAkas: null,
      tertiaryAkas: null,
      parents: [],
      influencedBy: [],
      relevance: 99,
      nsfw: false,
    }

    const accountsDb = new AccountsDatabase()
    const [account] = await accountsDb.insert(
      [
        {
          username: 'test-3',
          password: 'test-3',
        },
      ],
      dbConnection,
    )

    const id = await createGenre(genreData, account.id, dbConnection)

    const genreRelevanceVotesDb = new GenreRelevanceVotesDatabase()
    const genreRelevanceVote = await genreRelevanceVotesDb.findByGenreIdAndAccountId(
      id,
      account.id,
      dbConnection,
    )
    expect(genreRelevanceVote).toBeUndefined()

    const genresDb = new GenresDatabase()
    const genre = await genresDb.findByIdEdit(id, dbConnection)
    expect(genre?.relevance).toBe(99)
  })
})
