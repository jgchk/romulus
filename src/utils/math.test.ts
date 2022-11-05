import { mean, median, sum } from './math'

describe('sum', () => {
  test('adds numbers', () => {
    expect(sum([])).toEqual(0)
    expect(sum([999])).toEqual(999)
    expect(sum([1, 1])).toEqual(2)
    expect(sum([100, -1])).toEqual(99)
    expect(sum([0.5, 99])).toEqual(99.5)
    expect(sum([1, 2, 3])).toEqual(6)
  })
})

describe('mean', () => {
  test('averages numbers', () => {
    expect(mean([])).toEqual(Number.NaN)
    expect(mean([999])).toEqual(999)
    expect(mean([1, 3])).toEqual(2)
    expect(mean([1, 2])).toEqual(1.5)
    expect(mean([10, -10])).toEqual(0)
    expect(mean([1, 3, 5])).toEqual(3)
    expect(mean([1.5, 1.7])).toEqual(1.6)
  })
})

describe('median', () => {
  test('finds the median', () => {
    expect(median([])).toEqual(Number.NaN)
    expect(median([999])).toEqual(999)
    expect(median([1, 2, 5])).toEqual(2)
    expect(median([1, 2, 3, 5])).toEqual(2.5)
  })
})
