import { expect, it } from 'vitest'

import { createGenreStore } from '../infrastructure'
import { createExampleGenre } from '../types'
import { createIsPathValidQuery } from './is-path-valid'

it('should return true if the path is valid', () => {
  const genres = [
    createExampleGenre({ id: 0, children: [1] }),
    createExampleGenre({ id: 1, children: [2] }),
    createExampleGenre({ id: 2, children: [3] }),
    createExampleGenre({ id: 3, children: [] }),
  ]

  const isPathValid = createIsPathValidQuery(createGenreStore(genres))

  expect(isPathValid([0])).toBe(true)
  expect(isPathValid([0, 1])).toBe(true)
  expect(isPathValid([0, 1, 2])).toBe(true)
  expect(isPathValid([0, 1, 2, 3])).toBe(true)
})

it('should return false if the path is not valid', () => {
  const genres = [
    createExampleGenre({ id: 0, children: [1] }),
    createExampleGenre({ id: 1, children: [2] }),
    createExampleGenre({ id: 2, children: [3] }),
    createExampleGenre({ id: 3, children: [] }),
  ]

  const isPathValid = createIsPathValidQuery(createGenreStore(genres))

  expect(isPathValid([])).toBe(false)
  expect(isPathValid([1])).toBe(false)
  expect(isPathValid([1, 2])).toBe(false)
  expect(isPathValid([0, 1, 3])).toBe(false)
})
