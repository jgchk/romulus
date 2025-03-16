import { expect, it, vi } from 'vitest'

import { createGenreDatabase } from '../infrastructure/db'
import { createExampleGenre } from '../types'
import { createClearGenresCommand } from './clear-genres'
import { createSetGenreCommand } from './set-genre'

it('should do nothing if no genres are present', async () => {
  const db = await createGenreDatabase(new IDBFactory())
  const clearGenres = createClearGenresCommand(db)
  await clearGenres()

  const count = db.transaction('genres').objectStore('genres').count()
  const c = await new Promise((resolve) => (count.onsuccess = () => resolve(count.result)))
  expect(c).toBe(0)
})

it('should clear all genres', async () => {
  const db = await createGenreDatabase(new IDBFactory())

  const setGenre = createSetGenreCommand(db)
  await setGenre(createExampleGenre())

  const clearGenres = createClearGenresCommand(db)
  await clearGenres()

  const count = db.transaction('genres').objectStore('genres').count()
  const c = await new Promise((resolve) => (count.onsuccess = () => resolve(count.result)))
  expect(c).toBe(0)
})

it('should reject with an error if the clear request fails', async () => {
  const mockObjectStore = {
    clear: vi.fn(() => {
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

  const clearGenres = createClearGenresCommand(mockDb)

  await expect(clearGenres()).rejects.toThrow('Error clearing genres')
})
