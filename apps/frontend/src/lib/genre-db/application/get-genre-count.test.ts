import { expect, it } from 'vitest'

import { createGenreDatabase } from '../infrastructure/db'
import { createExampleGenre } from '../types'
import { createGetGenreCountQuery } from './get-genre-count'
import { createSetGenreCommand } from './set-genre'

it('should return 0 genres if there are none', async () => {
  const db = await createGenreDatabase(new IDBFactory())
  const getGenreCount = createGetGenreCountQuery(db)
  const count = await getGenreCount()
  expect(count).toBe(0)
})

it('should return 1 genre if there is one', async () => {
  const db = await createGenreDatabase(new IDBFactory())

  const setGenre = createSetGenreCommand(db)
  await setGenre(createExampleGenre())

  const getGenreCount = createGetGenreCountQuery(db)
  const count = await getGenreCount()

  expect(count).toBe(1)
})

it('should return 2 genres if there are two', async () => {
  const db = await createGenreDatabase(new IDBFactory())

  const setGenre = createSetGenreCommand(db)
  await setGenre(createExampleGenre({ id: 0 }))
  await setGenre(createExampleGenre({ id: 1 }))

  const getGenreCount = createGetGenreCountQuery(db)
  const count = await getGenreCount()

  expect(count).toBe(2)
})
