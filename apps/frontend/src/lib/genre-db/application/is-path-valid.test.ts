import { expect, it } from 'vitest'

import { createGenreDatabase } from '../infrastructure/db'
import { createExampleGenre } from '../types'
import { createGetChildrenQuery } from './get-children'
import { createGetDerivationsQuery } from './get-derivations'
import { createGetRootGenresQuery } from './get-root-genres'
import { createIsPathValidQuery } from './is-path-valid'
import { createSetGenreCommand } from './set-genre'

it('should return true if the path is valid', async () => {
  const db = await createGenreDatabase(new IDBFactory())

  const genres = [
    createExampleGenre({ id: 0, parents: [] }),
    createExampleGenre({ id: 1, parents: [0] }),
    createExampleGenre({ id: 2, parents: [1] }),
    createExampleGenre({ id: 3, parents: [2] }),
  ]

  const setGenre = createSetGenreCommand(db)
  await Promise.all(genres.map(setGenre))

  const isPathValid = createIsPathValidQuery({
    getRootGenres: createGetRootGenresQuery(db),
    getDerivations: createGetDerivationsQuery(db),
    getChildren: createGetChildrenQuery(db),
  })

  expect(await isPathValid([0])).toBe(true)
  expect(await isPathValid([0, 1])).toBe(true)
  expect(await isPathValid([0, 1, 2])).toBe(true)
  expect(await isPathValid([0, 1, 2, 3])).toBe(true)
})

it('should return false if the path is not valid', async () => {
  const db = await createGenreDatabase(new IDBFactory())

  const genres = [
    createExampleGenre({ id: 0, parents: [] }),
    createExampleGenre({ id: 1, parents: [0] }),
    createExampleGenre({ id: 2, parents: [1] }),
    createExampleGenre({ id: 3, parents: [2] }),
  ]

  const setGenre = createSetGenreCommand(db)
  await Promise.all(genres.map(setGenre))

  const isPathValid = createIsPathValidQuery({
    getRootGenres: createGetRootGenresQuery(db),
    getDerivations: createGetDerivationsQuery(db),
    getChildren: createGetChildrenQuery(db),
  })

  expect(await isPathValid([])).toBe(false)
  expect(await isPathValid([1])).toBe(false)
  expect(await isPathValid([1, 2])).toBe(false)
  expect(await isPathValid([0, 1, 3])).toBe(false)
})
