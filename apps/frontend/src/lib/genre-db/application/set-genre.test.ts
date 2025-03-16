import { expect, it, vi } from 'vitest'

import { createGenreDatabase } from '../infrastructure/db'
import { createExampleGenre } from '../types'
import { createGetGenreQuery } from './get-genre'
import { createSetGenreCommand } from './set-genre'

it('should insert a genre if it does not exist', async () => {
  const db = await createGenreDatabase(new IDBFactory())
  const setGenre = createSetGenreCommand(db)

  const genre = createExampleGenre()

  await setGenre({ ...genre })

  const getGenre = createGetGenreQuery(db)
  expect(await getGenre(genre.id)).toEqual({ ...genre })
})

it('should replace a genre if it exists', async () => {
  const db = await createGenreDatabase(new IDBFactory())
  const setGenre = createSetGenreCommand(db)

  const genre = createExampleGenre()

  await setGenre({ ...genre })

  await setGenre({ ...genre, name: 'Updated' })

  const getGenre = createGetGenreQuery(db)
  expect(await getGenre(genre.id)).toEqual({ ...genre, name: 'Updated' })
})

it('should reject with an error if the set request fails', async () => {
  const mockObjectStore = {
    put: vi.fn(() => {
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

  const setGenre = createSetGenreCommand(mockDb)

  await expect(setGenre(createExampleGenre())).rejects.toThrow('Error setting genre')
})
