import { expect, it } from 'vitest'

import { createExampleGenre } from '../types'
import { createGetChildrenQuery } from './get-children'

it('should return the IDs of the children of a genre', () => {
  const genres = [
    createExampleGenre({ id: 0, children: [1, 2] }),
    createExampleGenre({ id: 1, children: [] }),
    createExampleGenre({ id: 2, children: [] }),
  ]

  const getChildren = createGetChildrenQuery(genres)

  expect(getChildren(0)).toEqual([1, 2])
})
