import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getTimeSinceShort } from './datetime'

describe('getTimeSinceShort', () => {
  beforeEach(() => {
    // Mock the Date.now() function to return a fixed timestamp
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2023-01-01T00:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return seconds for less than a minute', () => {
    const date = new Date('2022-12-31T23:59:30Z')
    expect(getTimeSinceShort(date)).toBe('30s')
  })

  it('should return minutes for less than an hour', () => {
    const date = new Date('2022-12-31T23:30:00Z')
    expect(getTimeSinceShort(date)).toBe('30m')
  })

  it('should return hours for less than a day', () => {
    const date = new Date('2022-12-31T12:00:00Z')
    expect(getTimeSinceShort(date)).toBe('12h')
  })

  it('should return days for less than a month', () => {
    const date = new Date('2022-12-15T00:00:00Z')
    expect(getTimeSinceShort(date)).toBe('17d')
  })

  it('should return months for less than a year', () => {
    const date = new Date('2022-07-01T00:00:00Z')
    expect(getTimeSinceShort(date)).toBe('6mo')
  })

  it('should return years for more than a year', () => {
    const date = new Date('2021-01-01T00:00:00Z')
    expect(getTimeSinceShort(date)).toBe('2y')
  })

  it('should handle edge cases', () => {
    // Just under a minute
    expect(getTimeSinceShort(new Date('2022-12-31T23:59:01Z'))).toBe('59s')

    // Just over a minute
    expect(getTimeSinceShort(new Date('2022-12-31T23:58:59Z'))).toBe('1m')

    // Just under an hour
    expect(getTimeSinceShort(new Date('2022-12-31T23:01:00Z'))).toBe('59m')

    // Just over an hour
    expect(getTimeSinceShort(new Date('2022-12-31T22:59:00Z'))).toBe('1h')
  })
})
