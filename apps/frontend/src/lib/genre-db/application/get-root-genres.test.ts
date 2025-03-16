import { expect, it } from 'vitest'

import { createGenreDatabase } from '../infrastructure/db'
import { createExampleGenre } from '../types'
import { createGetRootGenresQuery } from './get-root-genres'
import { createSetGenreCommand } from './set-genre'

it('should return the IDs of all genres with no parents', async () => {
  const db = await createGenreDatabase(new IDBFactory())

  const genres = [
    createExampleGenre({ id: 0, parents: [] }),
    createExampleGenre({ id: 1, parents: [0] }),
    createExampleGenre({ id: 2, parents: [0] }),
    createExampleGenre({ id: 3, parents: [] }),
  ]

  const setGenre = createSetGenreCommand(db)
  await Promise.all(genres.map(setGenre))

  const getRootGenres = createGetRootGenresQuery(db)
  const rootGenres = await getRootGenres()
  expect(rootGenres).toEqual([genres[0], genres[3]])
})

it('should return an empty array if there are no genres', async () => {
  const db = await createGenreDatabase(new IDBFactory())

  const getRootGenres = createGetRootGenresQuery(db)
  const rootGenres = await getRootGenres()

  expect(rootGenres).toEqual([])
})
