/* eslint-disable @typescript-eslint/unbound-method */
import { describe, expect, it, vi } from 'vitest'

import type { IGenresDatabase } from '$lib/server/db/controllers/genre'
import { MockGenreHistoryDatabase } from '$lib/server/db/controllers/genre-history-mock'
import { MockGenresDatabase } from '$lib/server/db/controllers/genre-mock'
import { MockGenreParentsDatabase } from '$lib/server/db/controllers/genre-parents-mock'

import { deleteGenre, type DeleteGenreContext, NotFoundError } from './delete'

describe('deleteGenre', () => {
  function setup() {
    type MockConnection = { db: 'connection' }
    const mockConnection = Object.freeze({ db: 'connection' }) satisfies MockConnection

    const context = {
      transactor: {
        transaction: (fn) => fn(mockConnection),
      },
      genresDb: vi.mocked(MockGenresDatabase()),
      genreHistoryDb: vi.mocked(MockGenreHistoryDatabase()),
      genreParentsDb: vi.mocked(MockGenreParentsDatabase()),
    } satisfies DeleteGenreContext<MockConnection>

    const createMockGenre = <T>({
      id,
      parents = [],
      children = [],
    }: {
      id: number
      parents?: number[]
      children?: number[]
    }): NonNullable<Awaited<ReturnType<IGenresDatabase<T>['findByIdHistory']>>> => ({
      id,
      name: 'Test',
      subtitle: null,
      type: 'STYLE',
      shortDescription: null,
      longDescription: null,
      notes: null,
      akas: [],
      parents,
      children,
      influencedBy: [],
      influences: [],
      relevance: 99,
      nsfw: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return {
      context,
      mockConnection,
      createMockGenre,
    }
  }

  it('should delete the genre', async () => {
    const { context, createMockGenre } = setup()
    const genreId = 101
    const accountId = 202

    context.genresDb.findByIdHistory.mockResolvedValueOnce(createMockGenre({ id: genreId }))
    context.genresDb.findByIds.mockResolvedValueOnce([])

    await deleteGenre(genreId, accountId, context)

    expect(context.genresDb.deleteById).toHaveBeenCalledWith(genreId, expect.anything())
  })

  it('should throw NotFoundError if genre not found', async () => {
    const { context } = setup()
    const genreId = 101
    const accountId = 202

    context.genresDb.findByIdHistory.mockResolvedValueOnce(undefined)

    await expect(deleteGenre(genreId, accountId, context)).rejects.toThrow(NotFoundError)
  })

  it('should create a genre history entry', async () => {
    const { context, createMockGenre } = setup()
    const genreId = 101
    const accountId = 202

    context.genresDb.findByIdHistory.mockResolvedValueOnce(createMockGenre({ id: genreId }))
    context.genresDb.findByIds.mockResolvedValueOnce([])

    await deleteGenre(genreId, accountId, context)

    expect(context.genreHistoryDb.insert).toHaveBeenCalledWith(
      [
        {
          treeGenreId: genreId,
          operation: 'DELETE',
          accountId,
          name: 'Test',
          type: 'STYLE',
          subtitle: null,
          akas: [],
          influencedByGenreIds: [],
          longDescription: null,
          notes: null,
          nsfw: false,
          parentGenreIds: [],
          shortDescription: null,
        },
      ],
      expect.anything(),
    )
  })

  it("should move child genres under deleted genre's parents", async () => {
    const { context, createMockGenre } = setup()
    const genreId = 101
    const accountId = 202
    const parentIds = [1, 2]
    const childIds = [3, 4]

    context.genresDb.findByIdHistory.mockResolvedValueOnce(
      createMockGenre({ id: genreId, parents: parentIds, children: childIds }),
    )
    context.genresDb.findByIds.mockResolvedValueOnce([])

    await deleteGenre(genreId, accountId, context)

    childIds.forEach((childId) => {
      parentIds.forEach((parentId) => {
        expect(context.genreParentsDb.update).toHaveBeenCalledWith(
          genreId,
          childId,
          { parentId },
          expect.anything(),
        )
      })
    })
  })

  it('should create history entries for children that were moved', async () => {
    const { context, createMockGenre } = setup()
    const genreId = 101
    const accountId = 202
    const parentIds = [1, 2]
    const childIds = [3, 4]

    context.genresDb.findByIdHistory.mockResolvedValueOnce(
      createMockGenre({ id: genreId, parents: parentIds, children: childIds }),
    )
    context.genresDb.findByIds.mockResolvedValueOnce(
      childIds.map((id) => createMockGenre({ id, parents: parentIds })),
    )

    await deleteGenre(genreId, accountId, context)

    childIds.forEach((childId) => {
      expect(context.genreHistoryDb.insert).toHaveBeenCalledWith(
        [
          {
            treeGenreId: childId,
            operation: 'UPDATE',
            accountId,
            name: 'Test',
            type: 'STYLE',
            subtitle: null,
            akas: [],
            influencedByGenreIds: [],
            longDescription: null,
            notes: null,
            nsfw: false,
            parentGenreIds: parentIds,
            shortDescription: null,
          },
        ],
        expect.anything(),
      )
    })
  })

  it('should not run any operations on children if there are none', async () => {
    const { context, createMockGenre } = setup()
    const genreId = 101
    const accountId = 202
    const parentIds = [1, 2]

    context.genresDb.findByIdHistory.mockResolvedValueOnce(
      createMockGenre({ id: genreId, parents: parentIds }),
    )
    context.genresDb.findByIds.mockResolvedValueOnce([])

    await deleteGenre(genreId, accountId, context)

    expect(context.genreParentsDb.update).not.toHaveBeenCalled()
  })

  it('should use a single transaction for all database actions', async () => {
    const { context, createMockGenre, mockConnection } = setup()
    const genreId = 101
    const accountId = 202
    const parentIds = [1, 2]
    const childIds = [3, 4]

    context.genresDb.findByIdHistory.mockResolvedValueOnce(
      createMockGenre({ id: genreId, parents: parentIds, children: childIds }),
    )
    context.genresDb.findByIds.mockResolvedValueOnce(
      childIds.map((id) => createMockGenre({ id, parents: parentIds })),
    )

    await deleteGenre(genreId, accountId, context)

    expect(context.genresDb.findByIdHistory).toHaveBeenCalledWith(expect.anything(), mockConnection)
    expect(context.genreHistoryDb.insert).toHaveBeenCalledWith(expect.anything(), mockConnection)
    expect(context.genreParentsDb.update).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      mockConnection,
    )
  })
})
