/* eslint-disable @typescript-eslint/unbound-method */

import { describe, expect, it, vi } from 'vitest'

import { MockGenresDatabase } from '$lib/server/db/controllers/genre-mock'
import { MockGenreRelevanceVotesDatabase } from '$lib/server/db/controllers/genre-relevance-votes-mock'
import { UNSET_GENRE_RELEVANCE } from '$lib/types/genres'

import { setRelevanceVote, type SetRelevanceVoteContext } from './vote'

describe('setRelevanceVote', () => {
  function setup() {
    type MockConnection = { db: 'connection' }
    const mockConnection = Object.freeze({ db: 'connection' }) satisfies MockConnection

    const context = {
      transactor: {
        transaction: (fn) => fn(mockConnection),
      },
      genresDb: vi.mocked(MockGenresDatabase()),
      genreRelevanceVotesDb: vi.mocked(MockGenreRelevanceVotesDatabase()),
    } satisfies SetRelevanceVoteContext<MockConnection>

    return {
      context,
      mockConnection,
    }
  }

  it('should delete vote and update relevance when relevance is UNSET_GENRE_RELEVANCE', async () => {
    const { context, mockConnection } = setup()
    context.genreRelevanceVotesDb.findByGenreId.mockResolvedValue([])

    await setRelevanceVote(1, UNSET_GENRE_RELEVANCE, 123, context)

    expect(context.genreRelevanceVotesDb.deleteByGenreId).toHaveBeenCalledWith(1, mockConnection)
    expect(context.genresDb.update).toHaveBeenCalledWith(
      1,
      { relevance: UNSET_GENRE_RELEVANCE },
      mockConnection,
    )
  })

  it('should upsert vote and update relevance when relevance is not UNSET_GENRE_RELEVANCE', async () => {
    const { context, mockConnection } = setup()
    context.genreRelevanceVotesDb.findByGenreId.mockResolvedValue([
      { genreId: 1, accountId: 123, relevance: 5, createdAt: new Date(), updatedAt: new Date() },
    ])

    await setRelevanceVote(1, 5, 123, context)

    expect(context.genreRelevanceVotesDb.upsert).toHaveBeenCalledWith(
      {
        genreId: 1,
        accountId: 123,
        relevance: 5,
        updatedAt: expect.any(Date) as Date,
      },
      mockConnection,
    )
    expect(context.genresDb.update).toHaveBeenCalledWith(1, { relevance: 5 }, mockConnection)
  })

  it('should calculate median relevance correctly', async () => {
    const { context, mockConnection } = setup()
    context.genreRelevanceVotesDb.findByGenreId.mockResolvedValue([
      { genreId: 1, accountId: 123, relevance: 1, createdAt: new Date(), updatedAt: new Date() },
      { genreId: 1, accountId: 124, relevance: 2, createdAt: new Date(), updatedAt: new Date() },
      { genreId: 1, accountId: 125, relevance: 3, createdAt: new Date(), updatedAt: new Date() },
      { genreId: 1, accountId: 126, relevance: 4, createdAt: new Date(), updatedAt: new Date() },
      { genreId: 1, accountId: 127, relevance: 5, createdAt: new Date(), updatedAt: new Date() },
    ])

    await setRelevanceVote(1, 3, 123, context)

    expect(context.genresDb.update).toHaveBeenCalledWith(1, { relevance: 3 }, mockConnection)
  })

  it('should round median relevance to nearest integer', async () => {
    const { context, mockConnection } = setup()
    context.genreRelevanceVotesDb.findByGenreId.mockResolvedValue([
      { genreId: 1, accountId: 123, relevance: 1, createdAt: new Date(), updatedAt: new Date() },
      { genreId: 1, accountId: 124, relevance: 2, createdAt: new Date(), updatedAt: new Date() },
      { genreId: 1, accountId: 125, relevance: 3, createdAt: new Date(), updatedAt: new Date() },
      { genreId: 1, accountId: 126, relevance: 4, createdAt: new Date(), updatedAt: new Date() },
    ])

    await setRelevanceVote(1, 4, 123, context)

    expect(context.genresDb.update).toHaveBeenCalledWith(1, { relevance: 3 }, mockConnection)
  })
})
