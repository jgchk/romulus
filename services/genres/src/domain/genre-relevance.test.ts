import { err } from 'neverthrow'
import { describe, expect, it } from 'vitest'

import { MAX_GENRE_RELEVANCE, MIN_GENRE_RELEVANCE } from '../config'
import { InvalidGenreRelevanceError } from './errors/invalid-genre-relevance'
import { GenreRelevance } from './genre-relevance'

describe('GenreRelevance', () => {
  describe('create', () => {
    it('creates a valid GenreRelevance with minimum value', () => {
      const result = GenreRelevance.create(MIN_GENRE_RELEVANCE)
      if (result.isErr()) {
        expect.fail('Expected GenreRelevance to be created successfully')
      }

      expect(result.value).toBeInstanceOf(GenreRelevance)
      if (result.value instanceof GenreRelevance) {
        expect(result.value.relevance).toBe(MIN_GENRE_RELEVANCE)
      }
    })

    it('creates a valid GenreRelevance with maximum value', () => {
      const result = GenreRelevance.create(MAX_GENRE_RELEVANCE)
      if (result.isErr()) {
        expect.fail('Expected GenreRelevance to be created successfully')
      }

      expect(result.value).toBeInstanceOf(GenreRelevance)
      if (result.value instanceof GenreRelevance) {
        expect(result.value.relevance).toBe(MAX_GENRE_RELEVANCE)
      }
    })

    it('creates a valid GenreRelevance with middle value', () => {
      const middleValue = Math.floor((MAX_GENRE_RELEVANCE + MIN_GENRE_RELEVANCE) / 2)
      const result = GenreRelevance.create(middleValue)
      if (result.isErr()) {
        expect.fail('Expected GenreRelevance to be created successfully')
      }

      expect(result.value).toBeInstanceOf(GenreRelevance)
      if (result.value instanceof GenreRelevance) {
        expect(result.value.relevance).toBe(middleValue)
      }
    })

    it('returns InvalidGenreRelevanceError when value is below minimum', () => {
      const result = GenreRelevance.create(MIN_GENRE_RELEVANCE - 1)
      expect(result).toEqual(err(new InvalidGenreRelevanceError(MIN_GENRE_RELEVANCE - 1)))
    })

    it('returns InvalidGenreRelevanceError when value is above maximum', () => {
      const result = GenreRelevance.create(MAX_GENRE_RELEVANCE + 1)
      expect(result).toEqual(err(new InvalidGenreRelevanceError(MAX_GENRE_RELEVANCE + 1)))
    })

    it('returns InvalidGenreRelevanceError for non-integer values', () => {
      const result = GenreRelevance.create(3.5)
      expect(result).toEqual(err(new InvalidGenreRelevanceError(3.5)))
    })
  })
})
