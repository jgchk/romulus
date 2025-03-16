import { expect, it } from 'vitest'

import { createGenreDatabase } from '../infrastructure/db'
import { createExampleGenre } from '../types'
import { createGetDerivationsQuery } from './get-derivations'
import { createSetGenreCommand } from './set-genre'

it('should return the derivations of a genre', async () => {
  const db = await createGenreDatabase(new IDBFactory())

  const genres = [
    createExampleGenre({ id: 0, derivedFrom: [] }),
    createExampleGenre({ id: 1, derivedFrom: [0] }),
    createExampleGenre({ id: 2, derivedFrom: [0, 1] }),
  ]

  const setGenre = createSetGenreCommand(db)
  await Promise.all(genres.map(setGenre))

  const getDerivations = createGetDerivationsQuery(db)
  const children = await getDerivations(0)

  expect(children).toEqual([genres[1], genres[2]])
})
