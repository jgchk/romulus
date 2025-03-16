import { expect, it, vi } from 'vitest'

import { createGenreDatabase } from '../infrastructure/db'
import { createGetGenreQuery } from './get-genre'

it('should return the genre if it exists', async () => {
  const db = await createGenreDatabase(new IDBFactory())
  db.transaction('genres', 'readwrite').objectStore('genres').add({ id: 1 })

  const getGenreQuery = createGetGenreQuery(db)
  expect(await getGenreQuery(1)).toEqual({ id: 1 })
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
