import { expect, it } from 'vitest'

import { createIsPathValidQuery } from './is-path-valid'
import { createExampleGenre } from './types'

it('should return true if the path is valid', () => {
  const genres = [
    createExampleGenre({ id: 0, parents: [] }),
    createExampleGenre({ id: 1, parents: [0] }),
    createExampleGenre({ id: 2, parents: [1] }),
    createExampleGenre({ id: 3, parents: [2] }),
  ]

  const isPathValid = createIsPathValidQuery(genres)

  expect(isPathValid([0])).toBe(true)
  expect(isPathValid([0, 1])).toBe(true)
  expect(isPathValid([0, 1, 2])).toBe(true)
  expect(isPathValid([0, 1, 2, 3])).toBe(true)
})

it('should return false if the path is not valid', () => {
  const genres = [
    createExampleGenre({ id: 0, parents: [] }),
    createExampleGenre({ id: 1, parents: [0] }),
    createExampleGenre({ id: 2, parents: [1] }),
    createExampleGenre({ id: 3, parents: [2] }),
  ]

  const isPathValid = createIsPathValidQuery(genres)

  expect(isPathValid([])).toBe(false)
  expect(isPathValid([1])).toBe(false)
  expect(isPathValid([1, 2])).toBe(false)
  expect(isPathValid([0, 1, 3])).toBe(false)
})
