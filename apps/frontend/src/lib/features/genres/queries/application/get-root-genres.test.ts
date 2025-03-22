import { expect, it } from 'vitest'

import { createExampleGenre } from '../types'
import { createGetRootGenresQuery } from './get-root-genres'

it('should return the IDs of all genres with no parents', () => {
  const genres = [
    createExampleGenre({ id: 0, children: [1, 2] }),
    createExampleGenre({ id: 1 }),
    createExampleGenre({ id: 2 }),
    createExampleGenre({ id: 3 }),
  ]

  const getRootGenres = createGetRootGenresQuery(genres)

  expect(getRootGenres()).toEqual([0, 3])
})
