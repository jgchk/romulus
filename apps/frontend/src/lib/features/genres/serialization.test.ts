import { describe, expect, it } from 'vitest'

import { createExampleGenre } from './queries/types'
import { parseTreeGenre, stringifyTreeGenre } from './serialization'

describe('TreeGenre serialization round-trip', () => {
  it('should round-trip a basic genre', () => {
    const original = createExampleGenre({
      id: 123,
      name: 'Test Genre',
      subtitle: null,
      type: 'STYLE',
      relevance: 3,
      nsfw: false,
      children: [1, 2, 3],
      derivations: [4, 5],
      akas: ['Aka1', 'Aka2'],
      updatedAt: new Date(1609459200000), // 2021-01-01
    })

    const stringified = stringifyTreeGenre(original)
    const parsed = parseTreeGenre(stringified)

    expect(parsed).toEqual(original)
  })

  it('should round-trip a genre with subtitle', () => {
    const original = createExampleGenre({
      id: 456,
      name: 'Test Genre',
      subtitle: 'A subtitle',
      type: 'TREND',
      relevance: 5,
      nsfw: true,
      children: [],
      derivations: [],
      akas: [],
      updatedAt: new Date(1609459200000), // 2021-01-01
    })

    const stringified = stringifyTreeGenre(original)
    const parsed = parseTreeGenre(stringified)

    expect(parsed).toEqual(original)
  })

  it('should round-trip a genre with special characters in strings', () => {
    const original = createExampleGenre({
      id: 789,
      name: 'Test:with:colons',
      subtitle: 'Subtitle:with:colons',
      type: 'META',
      akas: ['Aka:with:colons'],
      updatedAt: new Date(1609459200000), // 2021-01-01
    })

    const stringified = stringifyTreeGenre(original)
    const parsed = parseTreeGenre(stringified)

    expect(parsed).toEqual(original)
  })

  it('should round-trip a complex genre with all properties', () => {
    const original = createExampleGenre({
      id: 999,
      name: 'Complex Genre',
      subtitle: 'With subtitle',
      type: 'SCENE',
      relevance: 7,
      nsfw: true,
      children: [11, 22, 33],
      derivations: [44, 55, 66],
      akas: ['Alias 1', 'Alias 2', 'Alias 3'],
      updatedAt: new Date(),
    })

    const stringified = stringifyTreeGenre(original)
    const parsed = parseTreeGenre(stringified)

    expect(parsed).toEqual(original)
  })

  it('should round-trip a genre with empty arrays and null subtitle', () => {
    const original = createExampleGenre({
      id: 555,
      name: 'Empty Arrays Genre',
      subtitle: null,
      type: 'MOVEMENT',
      relevance: 0,
      nsfw: false,
      children: [],
      derivations: [],
      akas: [],
      updatedAt: new Date(1609459200000),
    })

    const stringified = stringifyTreeGenre(original)
    const parsed = parseTreeGenre(stringified)

    expect(parsed).toEqual(original)
  })

  it('should round-trip a genre with Unicode characters', () => {
    const original = createExampleGenre({
      id: 777,
      name: 'Unicode 😀 Test',
      subtitle: '유니코드 테스트',
      type: 'STYLE',
      relevance: 4,
      nsfw: false,
      children: [100, 200],
      derivations: [300],
      akas: ['別名', 'Псевдоним'],
      updatedAt: new Date(1609459200000),
    })

    const stringified = stringifyTreeGenre(original)
    const parsed = parseTreeGenre(stringified)

    expect(parsed).toEqual(original)
  })
})

describe('parseTreeGenre error handling', () => {
  it('should throw error on malformed strings', () => {
    expect(() => parseTreeGenre('malformed')).toThrow('Invalid TreeGenre string')
    expect(() => parseTreeGenre('123')).toThrow('Invalid TreeGenre string')
    expect(() => parseTreeGenre('123:')).toThrow('Malformed TreeGenre string')
    expect(() => parseTreeGenre('123:10')).toThrow('Malformed TreeGenre string')
  })

  it('should throw error on unexpected format', () => {
    expect(() => parseTreeGenre('123 10:Test')).toThrow('Malformed TreeGenre string')
  })
})
