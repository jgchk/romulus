import { expect, it } from 'vitest'

import { createGenreDatabase } from '../infrastructure/db'
import { createExampleGenre } from '../types'
import { createGetChildrenQuery } from './get-children'
import { createSetGenreCommand } from './set-genre'

it('should return the IDs of the children of a genre', async () => {
  const db = await createGenreDatabase(new IDBFactory())

  const genres = [
    createExampleGenre({ id: 0, parents: [] }),
    createExampleGenre({ id: 1, parents: [0] }),
    createExampleGenre({ id: 2, parents: [0, 1] }),
  ]

  const setGenre = createSetGenreCommand(db)
  await Promise.all(genres.map(setGenre))

  const getChildren = createGetChildrenQuery(db)
  const children = await getChildren(0)

  expect(children).toEqual([genres[1], genres[2]])
})
