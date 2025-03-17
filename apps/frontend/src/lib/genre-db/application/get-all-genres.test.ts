import { expect, it, vi } from 'vitest'

import { createGenreDatabase } from '../infrastructure/db'
import { createExampleGenre } from '../types'
import { createGetAllGenresQuery } from './get-all-genres'
import { createSetGenreCommand } from './set-genre'

it('should return all genres', async () => {
  const db = await createGenreDatabase(new IDBFactory())

  const genres = [createExampleGenre({ id: 1 }), createExampleGenre({ id: 2 })]

  const setGenre = createSetGenreCommand(db)
  await Promise.all(genres.map(setGenre))

  const getAllGenres = createGetAllGenresQuery(db)
  expect(await getAllGenres()).toEqual(genres)
})

it('should return an empty array if no genres exist', async () => {
  const db = await createGenreDatabase(new IDBFactory())
  const getAllGenres = createGetAllGenresQuery(db)
  expect(await getAllGenres()).toEqual([])
})

it('should reject with an error if the get request fails', async () => {
  const mockObjectStore = {
    getAll: vi.fn(() => {
      const request = {
        onsuccess: null,
        onerror: null,
      } as unknown as IDBRequest
      setTimeout(() => {
        if (request.onerror) {
          request.onerror(new Event('error'))
        }
      }, 0)
      return request
    }),
  }

  const mockTransaction = {
    objectStore: vi.fn(() => mockObjectStore),
  }

  const mockDb = {
    transaction: vi.fn(() => mockTransaction),
  } as unknown as IDBDatabase

  const getAllGenres = createGetAllGenresQuery(mockDb)

  await expect(getAllGenres()).rejects.toThrow('Error getting all genres')
})
