import { expect, it } from 'vitest'

import { createGetPathToQuery } from './get-path-to'
import { createExampleGenre } from './types'

it('should return the shortest path to a genre', () => {
  const genres = [
    createExampleGenre({ id: 0, children: [1] }),
    createExampleGenre({ id: 1, children: [2] }),
    createExampleGenre({ id: 2, children: [3] }),
    createExampleGenre({ id: 3, children: [] }),
  ]

  const getPathTo = createGetPathToQuery(genres)

  expect(getPathTo(0)).toEqual([0])
  expect(getPathTo(1)).toEqual([0, 1])
  expect(getPathTo(2)).toEqual([0, 1, 2])
  expect(getPathTo(3)).toEqual([0, 1, 2, 3])
})

it('should return the shortest path to a genre', () => {
  const genres = [
    {
      id: 1,
      name: 'gooby',
      subtitle: null,
      type: 'STYLE' as const,
      relevance: 99,
      nsfw: false,
      updatedAt: new Date(),
      derivedFrom: [],
      akas: [],
      children: [2],
    },
    {
      id: 2,
      name: 'gooby2',
      subtitle: null,
      type: 'STYLE' as const,
      relevance: 99,
      nsfw: false,
      updatedAt: new Date(),
      derivedFrom: [],
      akas: [],
      children: [],
    },
    {
      id: 3,
      name: 'yo',
      subtitle: null,
      type: 'STYLE' as const,
      relevance: 99,
      nsfw: false,
      updatedAt: new Date(),
      derivedFrom: [],
      akas: [],
      children: [],
    },
  ]

  const getPathTo = createGetPathToQuery(genres)

  expect(getPathTo(2)).toEqual([1, 2])
})
