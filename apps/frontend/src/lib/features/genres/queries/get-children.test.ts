import { expect, it } from 'vitest'

import { createGetChildrenQuery } from './get-children'
import { createExampleGenre } from './types'

it('should return the IDs of the children of a genre', () => {
  const genres = [
    createExampleGenre({ id: 0, parents: [] }),
    createExampleGenre({ id: 1, parents: [0] }),
    createExampleGenre({ id: 2, parents: [0] }),
  ]

  const getChildren = createGetChildrenQuery(genres)

  expect(getChildren(0)).toEqual([1, 2])
})
