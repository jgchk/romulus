import { expect, it, vi } from 'vitest'

import { createGenreDatabase } from '../infrastructure/db'
import { createExampleGenre } from '../types'
import { createGetGenreQuery } from './get-genre'
import { createSetGenreCommand } from './set-genre'
import { createSetGenresCommand } from './set-genres'

it('should insert genres if they do not exist', async () => {
  const db = await createGenreDatabase(new IDBFactory())

  const genres = [createExampleGenre({ id: 0 }), createExampleGenre({ id: 1 })]

  const setGenres = createSetGenresCommand(db)
  await setGenres(genres)

  const getGenre = createGetGenreQuery(db)
  expect(await getGenre(0)).toEqual(genres[0])
  expect(await getGenre(1)).toEqual(genres[1])
})

it('should replace a genre if it exists', async () => {
  const db = await createGenreDatabase(new IDBFactory())

  const setGenre = createSetGenreCommand(db)
  const genre = createExampleGenre()
  await setGenre({ ...genre })

  const setGenres = createSetGenresCommand(db)
  await setGenres([{ ...genre, name: 'Updated' }])

  const getGenre = createGetGenreQuery(db)
  expect(await getGenre(genre.id)).toEqual({ ...genre, name: 'Updated' })
})

it('should reject with an error if the transaction fails', async () => {
  const mockObjectStore = {
    put: vi.fn(() => {
      return {
        onsuccess: null,
        onerror: null,
      } as unknown as IDBRequest
    }),
  }

  const mockTransaction = {
    objectStore: vi.fn(() => mockObjectStore),
    oncomplete: null,
    onerror: null,
  } as unknown as IDBTransaction

  const mockDb = {
    transaction: vi.fn(() => mockTransaction),
  } as unknown as IDBDatabase

  const setGenres = createSetGenresCommand(mockDb)

  setTimeout(() => {
    if (mockTransaction.onerror) {
      mockTransaction.onerror(new Event('error'))
    }
  }, 0)

  await expect(setGenres([createExampleGenre()])).rejects.toThrow('Error setting genres')
})
