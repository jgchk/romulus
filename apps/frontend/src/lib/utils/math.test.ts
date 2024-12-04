import { describe, expect, it } from 'vitest'

import { median } from './math'

describe('median', () => {
  it('should return the middle value for an odd-length array', () => {
    expect(median([1, 2, 3])).toBe(2)
    expect(median([5, 3, 1, 2, 4])).toBe(3)
  })

  it('should return the average of two middle values for an even-length array', () => {
    expect(median([1, 2, 3, 4])).toBe(2.5)
    expect(median([1, 3, 5, 7])).toBe(4)
  })

  it('should handle arrays with negative numbers', () => {
    expect(median([-3, -1, 0, 2, 4])).toBe(0)
    expect(median([-5, -2, -1, 3, 7, 8])).toBe(1)
  })

  it('should return the single value for an array with one element', () => {
    expect(median([42])).toBe(42)
  })

  it('should handle arrays with duplicate values', () => {
    expect(median([1, 2, 2, 3, 4, 5])).toBe(2.5)
    expect(median([3, 3, 3, 3, 3])).toBe(3)
  })

  it('should handle arrays with decimal numbers', () => {
    expect(median([1.5, 2.5, 3.5])).toBe(2.5)
    expect(median([1.1, 2.2, 3.3, 4.4])).toBe(2.75)
  })

  it('should return NaN for an empty array', () => {
    expect(median([])).toBeNaN()
  })

  it('should not modify the original array', () => {
    const originalArray = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]
    const copyArray = [...originalArray]
    median(originalArray)
    expect(originalArray).toEqual(copyArray)
  })
})
