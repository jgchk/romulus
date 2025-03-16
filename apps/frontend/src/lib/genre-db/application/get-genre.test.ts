import { expect, it, vi } from 'vitest'

import { createGenreDatabase } from '../infrastructure/db'
import { createExampleGenre } from '../types'
import { createGetGenreQuery } from './get-genre'
import { createSetGenreCommand } from './set-genre'

it('should return the genre if it exists', async () => {
  const db = await createGenreDatabase(new IDBFactory())

  const genre = createExampleGenre({ id: 1 })

  const setGenre = createSetGenreCommand(db)
  await setGenre(genre)

  const getGenreQuery = createGetGenreQuery(db)
  expect(await getGenreQuery(1)).toEqual(genre)
})

it('should return undefined if the genre does not exist', async () => {
  const db = await createGenreDatabase(new IDBFactory())
  const getGenreQuery = createGetGenreQuery(db)
  expect(await getGenreQuery(1)).toBeUndefined()
})

it('should reject with an error if the get request fails', async () => {
  const mockObjectStore = {
    get: vi.fn(() => {
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

  const getGenre = createGetGenreQuery(mockDb)

  await expect(getGenre(1)).rejects.toThrow('Error getting genre')
})
