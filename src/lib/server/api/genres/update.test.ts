/* eslint-disable @typescript-eslint/unbound-method */

import { describe, expect, it, vi } from 'vitest'

import type { IGenresDatabase } from '$lib/server/db/controllers/genre'
import { MockGenreHistoryDatabase } from '$lib/server/db/controllers/genre-history-mock'
import { MockGenresDatabase } from '$lib/server/db/controllers/genre-mock'
import { GenreCycleError } from '$lib/server/genres'

import { type GenreData, NotFoundError } from './types'
import { NoUpdatesError, SelfInfluenceError, updateGenre, type UpdateGenreContext } from './update'

describe('updateGenre', () => {
  const ORIGINAL_GENRE: NonNullable<Awaited<ReturnType<IGenresDatabase<unknown>['findByIdEdit']>>> =
    Object.freeze({
      id: 0,
      name: 'Original Genre',
      shortDescription: 'Short desc',
      longDescription: 'Long desc',
      notes: 'Notes',
      type: 'STYLE',
      subtitle: 'Subtitle',
      nsfw: false,
      parents: [],
      influencedBy: [],
      akas: [],
      relevance: 99,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

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

  function setup() {
    type MockConnection = { db: 'connection' }
    const mockConnection = Object.freeze({ db: 'connection' }) satisfies MockConnection

    const context = {
      transactor: {
        transaction: (fn) => fn(mockConnection),
      },
      genresDb: vi.mocked(MockGenresDatabase()),
      genreHistoryDb: vi.mocked(MockGenreHistoryDatabase()),
    } satisfies UpdateGenreContext<MockConnection>

    context.genresDb.findByIdEdit.mockResolvedValue(ORIGINAL_GENRE)
    context.genreHistoryDb.findLatestByGenreId.mockResolvedValue({
      ...ORIGINAL_GENRE,
      treeGenreId: ORIGINAL_GENRE.id,
      parentGenreIds: ORIGINAL_GENRE.parents,
      influencedByGenreIds: ORIGINAL_GENRE.influencedBy,
      operation: 'CREATE',
      accountId: 0,
    })
    context.genresDb.update.mockImplementation((_, update) => {
      return Promise.resolve({ ...ORIGINAL_GENRE, ...update })
    })
    context.genresDb.findAllSimple.mockResolvedValue([])

    return {
      context,
      mockConnection,
    }
  }

  it('should update the genre when all checks pass', async () => {
    const { context, mockConnection } = setup()

    await updateGenre(ORIGINAL_GENRE.id, GENRE_UPDATE, 123, context)

    expect(context.genresDb.update).toHaveBeenCalledWith(
      ORIGINAL_GENRE.id,
      {
        name: 'Updated Genre',
        shortDescription: 'Updated short desc',
        longDescription: 'Updated long desc',
        notes: 'Updated notes',
        type: 'META',
        subtitle: 'Updated subtitle',
        nsfw: true,
        parents: [3, 4],
        influencedBy: [5, 6],
        akas: [],
        updatedAt: expect.any(Date) as Date,
      },
      mockConnection,
    )
  })

  it('should throw NotFoundError if genre is not found', async () => {
    const { context } = setup()

    context.genresDb.findByIdEdit.mockResolvedValue(undefined)

    await expect(updateGenre(1, GENRE_UPDATE, 123, context)).rejects.toThrow(NotFoundError)
  })

  it('should throw GenreCycleError if a cycle is detected', async () => {
    const { context } = setup()

    context.genresDb.findAllSimple.mockResolvedValue([
      { id: 0, name: ORIGINAL_GENRE.name, parents: ORIGINAL_GENRE.parents },
      { id: 1, name: 'Parent', parents: [0] },
      { id: 2, name: 'Child', parents: [1] },
      { id: 3, name: 'Grandchild', parents: [2] },
    ])

    await expect(updateGenre(1, { ...GENRE_UPDATE, parents: [2] }, 123, context)).rejects.toThrow(
      GenreCycleError,
    )
  })

  it('should throw SelfInfluenceError if genre influences itself', async () => {
    const { context } = setup()

    await expect(
      updateGenre(
        ORIGINAL_GENRE.id,
        { ...GENRE_UPDATE, influencedBy: [ORIGINAL_GENRE.id] },
        123,
        context,
      ),
    ).rejects.toThrow(SelfInfluenceError)
  })

  it('should not update if no changes are detected', async () => {
    const { context } = setup()

    await expect(
      updateGenre(
        ORIGINAL_GENRE.id,
        { ...ORIGINAL_GENRE, primaryAkas: '', secondaryAkas: '', tertiaryAkas: '' },
        123,
        context,
      ),
    ).rejects.toThrow(NoUpdatesError)

    expect(context.genresDb.update).not.toHaveBeenCalled()
  })

  it('should correctly process AKAs', async () => {
    const { context, mockConnection } = setup()

    await updateGenre(
      ORIGINAL_GENRE.id,
      {
        ...GENRE_UPDATE,
        primaryAkas: 'primary-one, primary-two',
        secondaryAkas: 'secondary-one, secondary-two',
        tertiaryAkas: 'tertiary-one, tertiary-two',
      },
      123,
      context,
    )

    expect(context.genresDb.update).toHaveBeenCalledWith(
      ORIGINAL_GENRE.id,
      {
        name: 'Updated Genre',
        shortDescription: 'Updated short desc',
        longDescription: 'Updated long desc',
        notes: 'Updated notes',
        type: 'META',
        subtitle: 'Updated subtitle',
        nsfw: true,
        parents: [3, 4],
        influencedBy: [5, 6],
        akas: [
          { genreId: ORIGINAL_GENRE.id, name: 'primary-one', relevance: 3, order: 0 },
          { genreId: ORIGINAL_GENRE.id, name: 'primary-two', relevance: 3, order: 1 },
          { genreId: ORIGINAL_GENRE.id, name: 'secondary-one', relevance: 2, order: 0 },
          { genreId: ORIGINAL_GENRE.id, name: 'secondary-two', relevance: 2, order: 1 },
          { genreId: ORIGINAL_GENRE.id, name: 'tertiary-one', relevance: 1, order: 0 },
          { genreId: ORIGINAL_GENRE.id, name: 'tertiary-two', relevance: 1, order: 1 },
        ],
        updatedAt: expect.any(Date) as Date,
      },
      mockConnection,
    )
  })

  it('should create a history entry', async () => {
    const { context, mockConnection } = setup()

    await updateGenre(ORIGINAL_GENRE.id, GENRE_UPDATE, 123, context)

    expect(context.genreHistoryDb.insert).toHaveBeenCalledWith(
      [
        {
          name: 'Updated Genre',
          shortDescription: 'Updated short desc',
          longDescription: 'Updated long desc',
          notes: 'Updated notes',
          parentGenreIds: [3, 4],
          influencedByGenreIds: [5, 6],
          treeGenreId: ORIGINAL_GENRE.id,
          nsfw: true,
          operation: 'UPDATE',
          accountId: 123,
          subtitle: 'Updated subtitle',
          akas: [],
          type: 'META',
        },
      ],
      mockConnection,
    )
  })
})
