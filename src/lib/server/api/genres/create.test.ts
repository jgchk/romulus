/* eslint-disable @typescript-eslint/unbound-method */

import { omit } from 'ramda'
import { describe, expect, it, vi } from 'vitest'

import type { IGenresDatabase } from '$lib/server/db/controllers/genre'
import { MockGenreHistoryDatabase } from '$lib/server/db/controllers/genre-history-mock'
import { MockGenresDatabase } from '$lib/server/db/controllers/genre-mock'
import { MockGenreRelevanceVotesDatabase } from '$lib/server/db/controllers/genre-relevance-votes-mock'

import { createGenre, type CreateGenreContext } from './create'
import type { GenreData } from './types'

describe('createGenre', () => {
  function setup() {
    type MockConnection = { db: 'connection' }
    const mockConnection = Object.freeze({ db: 'connection' }) satisfies MockConnection

    const context = {
      transactor: {
        transaction: (fn) => fn(mockConnection),
      },
      genresDb: vi.mocked(MockGenresDatabase()),
      genreHistoryDb: vi.mocked(MockGenreHistoryDatabase()),
      genreRelevanceVotesDb: vi.mocked(MockGenreRelevanceVotesDatabase()),
    } satisfies CreateGenreContext<MockConnection>

    return {
      context,
      mockConnection,
    }
  }

  it('should return the created genre id', async () => {
    const { context } = setup()

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

    const accountId = 10101

    const insertedGenre: Awaited<ReturnType<IGenresDatabase<null>['insert']>>[number] = {
      id: 1,
      ...omit(['primaryAkas', 'secondaryAkas', 'tertiaryAkas'], genreData),
      akas: [],
      relevance: 99,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    context.genresDb.insert.mockResolvedValueOnce([insertedGenre])

    const genreId = await createGenre(genreData, accountId, context)

    expect(genreId).toBe(insertedGenre.id)
  })

  it('should insert the genre into the database', async () => {
    const { context } = setup()

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

    const accountId = 10101

    const insertedGenre: Awaited<ReturnType<IGenresDatabase<null>['insert']>>[number] = {
      id: 1,
      ...omit(['primaryAkas', 'secondaryAkas', 'tertiaryAkas'], genreData),
      akas: [],
      relevance: 99,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    context.genresDb.insert.mockResolvedValueOnce([insertedGenre])

    await createGenre(genreData, accountId, context)

    expect(context.genresDb.insert).toHaveBeenCalledTimes(1)
    expect(context.genresDb.insert).toHaveBeenCalledWith(
      [
        {
          ...genreData,
          akas: [],
          updatedAt: expect.any(Date) as Date,
        },
      ],
      expect.anything(),
    )
  })

  it('should map AKAs correctly', async () => {
    const { context } = setup()

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

    const accountId = 10101

    const insertedGenre: Awaited<ReturnType<IGenresDatabase<null>['insert']>>[number] = {
      id: 1,
      ...omit(['primaryAkas', 'secondaryAkas', 'tertiaryAkas'], genreData),
      akas: [
        { name: 'primary one', relevance: 3, order: 0 },
        { name: 'primary two', relevance: 3, order: 1 },
        { name: 'secondary one', relevance: 2, order: 0 },
        { name: 'secondary two', relevance: 2, order: 1 },
        { name: 'tertiary one', relevance: 1, order: 0 },
        { name: 'tertiary two', relevance: 1, order: 1 },
      ],
      relevance: 99,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    context.genresDb.insert.mockResolvedValueOnce([insertedGenre])

    await createGenre(genreData, accountId, context)

    expect(context.genresDb.insert).toHaveBeenCalledTimes(1)
    expect(context.genresDb.insert).toHaveBeenCalledWith(
      [
        {
          ...genreData,
          akas: [
            { name: 'primary one', relevance: 3, order: 0 },
            { name: 'primary two', relevance: 3, order: 1 },
            { name: 'secondary one', relevance: 2, order: 0 },
            { name: 'secondary two', relevance: 2, order: 1 },
            { name: 'tertiary one', relevance: 1, order: 0 },
            { name: 'tertiary two', relevance: 1, order: 1 },
          ],
          updatedAt: expect.any(Date) as Date,
        },
      ],
      expect.anything(),
    )
  })

  it('should insert a history entry', async () => {
    const { context } = setup()

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

    const accountId = 10101

    const insertedGenre: Awaited<ReturnType<IGenresDatabase<null>['insert']>>[number] = {
      id: 1,
      ...omit(['primaryAkas', 'secondaryAkas', 'tertiaryAkas'], genreData),
      akas: [],
      relevance: 99,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    context.genresDb.insert.mockResolvedValueOnce([insertedGenre])

    await createGenre(genreData, accountId, context)

    expect(context.genreHistoryDb.insert).toHaveBeenCalledTimes(1)
    expect(context.genreHistoryDb.insert).toHaveBeenCalledWith(
      [
        {
          treeGenreId: insertedGenre.id,
          name: 'Test',
          subtitle: null,
          type: 'STYLE',
          shortDescription: null,
          longDescription: null,
          notes: null,
          akas: [],
          parentGenreIds: [],
          influencedByGenreIds: [],
          relevance: 99,
          nsfw: false,
          accountId,
          operation: 'CREATE',
        },
      ],
      expect.anything(),
    )
  })

  it('should insert a relevance vote when relevance is set', async () => {
    const { context } = setup()

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

    const accountId = 10101

    const insertedGenre: Awaited<ReturnType<IGenresDatabase<null>['insert']>>[number] = {
      id: 1,
      ...omit(['primaryAkas', 'secondaryAkas', 'tertiaryAkas'], genreData),
      akas: [],
      relevance: 99,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    context.genresDb.insert.mockResolvedValueOnce([insertedGenre])

    await createGenre(genreData, accountId, context)

    expect(context.genreRelevanceVotesDb.upsert).toHaveBeenCalledTimes(1)
    expect(context.genreRelevanceVotesDb.upsert).toHaveBeenCalledWith(
      {
        genreId: insertedGenre.id,
        accountId,
        relevance: 1,
        updatedAt: expect.any(Date) as Date,
      },
      expect.anything(),
    )
  })

  it('should not insert a relevance vote when relevance is undefined', async () => {
    const { context } = setup()

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

    const accountId = 10101

    const insertedGenre: Awaited<ReturnType<IGenresDatabase<null>['insert']>>[number] = {
      id: 1,
      ...omit(['primaryAkas', 'secondaryAkas', 'tertiaryAkas'], genreData),
      akas: [],
      relevance: 99,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    context.genresDb.insert.mockResolvedValueOnce([insertedGenre])

    await createGenre(genreData, accountId, context)

    expect(context.genreRelevanceVotesDb.upsert).not.toHaveBeenCalled()
  })

  it('should not insert a relevance vote when relevance is unset', async () => {
    const { context } = setup()

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

    const accountId = 10101

    const insertedGenre: Awaited<ReturnType<IGenresDatabase<null>['insert']>>[number] = {
      id: 1,
      ...omit(['primaryAkas', 'secondaryAkas', 'tertiaryAkas'], genreData),
      akas: [],
      relevance: 99,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    context.genresDb.insert.mockResolvedValueOnce([insertedGenre])

    await createGenre(genreData, accountId, context)

    expect(context.genreRelevanceVotesDb.upsert).not.toHaveBeenCalled()
  })

  it('should use a single transaction for all database actions', async () => {
    const { context, mockConnection } = setup()

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

    const accountId = 10101

    const insertedGenre: Awaited<ReturnType<IGenresDatabase<null>['insert']>>[number] = {
      id: 1,
      ...omit(['primaryAkas', 'secondaryAkas', 'tertiaryAkas'], genreData),
      akas: [],
      relevance: 99,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    context.genresDb.insert.mockResolvedValueOnce([insertedGenre])

    await createGenre(genreData, accountId, context)

    expect(context.genresDb.insert).toHaveBeenCalledWith(expect.anything(), mockConnection)
    expect(context.genreHistoryDb.insert).toHaveBeenCalledWith(expect.anything(), mockConnection)
    expect(context.genreRelevanceVotesDb.upsert).toHaveBeenCalledWith(
      expect.anything(),
      mockConnection,
    )
  })
})
