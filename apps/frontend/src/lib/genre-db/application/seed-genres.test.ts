import { expect, it } from 'vitest'

import { createGenreDatabase } from '../infrastructure/db'
import { createExampleGenre } from '../types'
import { createClearGenresCommand } from './clear-genres'
import { createGetGenreQuery } from './get-genre'
import { createGetGenreCountQuery } from './get-genre-count'
import { createSeedGenresCommand } from './seed-genres'
import { createSetGenreCommand } from './set-genre'
import { createSetGenresCommand } from './set-genres'

it('should delete all existing genres and seed the database with new genres', async () => {
  const db = await createGenreDatabase(new IDBFactory())

  const existingGenres = [
    createExampleGenre({ id: 0, parents: [] }),
    createExampleGenre({ id: 1, parents: [0] }),
  ]

  const setGenre = createSetGenreCommand(db)
  await Promise.all(existingGenres.map(setGenre))

  const newGenres = [
    createExampleGenre({ id: 2, parents: [] }),
    createExampleGenre({ id: 3, parents: [] }),
    createExampleGenre({ id: 4, parents: [3] }),
  ]

  const seedGenres = createSeedGenresCommand({
    clearGenres: createClearGenresCommand(db),
    setGenres: createSetGenresCommand(db),
  })
  await seedGenres(newGenres)

  const getGenreCount = createGetGenreCountQuery(db)
  expect(await getGenreCount()).toBe(3)

  const getGenre = createGetGenreQuery(db)
  expect(await getGenre(0)).toBeUndefined()
  expect(await getGenre(1)).toBeUndefined()
  expect(await getGenre(2)).toEqual(newGenres[0])
  expect(await getGenre(3)).toEqual(newGenres[1])
  expect(await getGenre(4)).toEqual(newGenres[2])
})
