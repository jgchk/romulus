import { expect, it } from 'vitest'

import { createGetRootGenresQuery } from './get-root-genres'
import { createExampleGenre } from './types'

it('should return the IDs of all genres with no parents', () => {
  const genres = [
    createExampleGenre({ id: 0, parents: [] }),
    createExampleGenre({ id: 1, parents: [0] }),
    createExampleGenre({ id: 2, parents: [0] }),
    createExampleGenre({ id: 3, parents: [] }),
  ]

  const getRootGenres = createGetRootGenresQuery(genres)

  expect(getRootGenres()).toEqual([0, 3])
})
