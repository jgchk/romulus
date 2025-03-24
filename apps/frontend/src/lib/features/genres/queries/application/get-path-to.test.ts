import { expect, it } from 'vitest'

import { createGenreStore } from '../infrastructure'
import { createExampleGenre } from '../types'
import { createGetPathToQuery } from './get-path-to'

it('should return the shortest path to a genre', () => {
  const genres = [
    createExampleGenre({ id: 0, children: [1] }),
    createExampleGenre({ id: 1, children: [2] }),
    createExampleGenre({ id: 2, children: [3] }),
    createExampleGenre({ id: 3, children: [] }),
  ]

  const getPathTo = createGetPathToQuery(createGenreStore(genres))

  expect(getPathTo(0)).toEqual([0])
  expect(getPathTo(1)).toEqual([0, 1])
  expect(getPathTo(2)).toEqual([0, 1, 2])
  expect(getPathTo(3)).toEqual([0, 1, 2, 3])
})

it('should utilize derived paths when finding the shortest path', () => {
  const genres = [
    createExampleGenre({ id: 0, children: [1], derivations: [3] }),
    createExampleGenre({ id: 1, children: [2] }),
    createExampleGenre({ id: 2, children: [3] }),
    createExampleGenre({ id: 3, children: [] }),
  ]

  const getPathTo = createGetPathToQuery(createGenreStore(genres))

  expect(getPathTo(3)).toEqual([0, 'derived', 3])
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
      derivations: [],
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
      derivations: [],
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
      derivations: [],
      akas: [],
      children: [],
    },
  ]

  const getPathTo = createGetPathToQuery(createGenreStore(genres))

  expect(getPathTo(2)).toEqual([1, 2])
})

it('should reuse as much of the existing selected path as possible', () => {
  const genres = [
    createExampleGenre({ id: 0, children: [1, 2] }),
    createExampleGenre({ id: 1, children: [2] }),
    createExampleGenre({ id: 2 }),
  ]

  const getPathTo = createGetPathToQuery(createGenreStore(genres))

  expect(getPathTo(2)).toEqual([0, 2])
  expect(getPathTo(2, [0, 1])).toEqual([0, 1, 2])
})

it('should reuse as much of the existing selected path as possible', () => {
  const genres = [
    createExampleGenre({ id: 4483, children: [3383] }),
    createExampleGenre({ id: 3383, children: [1139] }),
    createExampleGenre({ id: 1139, children: [1789] }),
    createExampleGenre({ id: 2851, children: [2811] }),
    createExampleGenre({ id: 2811, children: [5008] }),
    createExampleGenre({ id: 5008, children: [2812] }),
    createExampleGenre({ id: 2812, children: [2853] }),
    createExampleGenre({ id: 2853, children: [12966] }),
    createExampleGenre({ id: 12966, children: [1789] }),
    createExampleGenre({ id: 1789 }),
  ]

  const getPathTo = createGetPathToQuery(createGenreStore(genres))

  expect(getPathTo(1789, [2851, 2811, 5008, 2812, 2853, 12966])).toEqual([
    2851, 2811, 5008, 2812, 2853, 12966, 1789,
  ])
})

it('should utilize derived paths when reusing as much of the existing selected path as possible', () => {
  const genres = [
    createExampleGenre({ id: 4483, children: [3383] }),
    createExampleGenre({ id: 3383, children: [1139] }),
    createExampleGenre({ id: 1139, children: [1789] }),
    createExampleGenre({ id: 2851, children: [2811] }),
    createExampleGenre({ id: 2811, children: [5008] }),
    createExampleGenre({ id: 5008, children: [2812] }),
    createExampleGenre({ id: 2812, children: [2853] }),
    createExampleGenre({ id: 2853, children: [12966] }),
    createExampleGenre({ id: 12966, derivations: [1789] }),
    createExampleGenre({ id: 1789 }),
  ]

  const getPathTo = createGetPathToQuery(createGenreStore(genres))

  expect(getPathTo(1789, [2851, 2811, 5008, 2812, 2853, 12966])).toEqual([
    2851,
    2811,
    5008,
    2812,
    2853,
    12966,
    'derived',
    1789,
  ])
})
