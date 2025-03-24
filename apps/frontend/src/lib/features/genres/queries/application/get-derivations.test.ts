import { expect, it } from 'vitest'

import { createGenreStore } from '../infrastructure'
import { createExampleGenre } from '../types'
import { createGetDerivationsQuery } from './get-derivations'

it('should return the IDs of the derived genres of a genre', () => {
  const genres = [
    createExampleGenre({ id: 0, derivations: [1, 2] }),
    createExampleGenre({ id: 1 }),
    createExampleGenre({ id: 2 }),
  ]

  const getDerivations = createGetDerivationsQuery(createGenreStore(genres))

  expect(getDerivations(0)).toEqual([1, 2])
})
