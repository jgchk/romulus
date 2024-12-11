import { describe, expect, it } from 'vitest'

import { MAX_GENRE_RELEVANCE, MIN_GENRE_RELEVANCE } from '../../config'
import { InvalidGenreRelevanceError } from './errors/invalid-genre-relevance'
import { GenreRelevance } from './genre-relevance'

describe('GenreRelevance', () => {
  describe('create', () => {
    it('creates a valid GenreRelevance with minimum value', () => {
      const result = GenreRelevance.create(MIN_GENRE_RELEVANCE)

      expect(result).toBeInstanceOf(GenreRelevance)
      if (result instanceof GenreRelevance) {
        expect(result.relevance).toBe(MIN_GENRE_RELEVANCE)
      }
    })

    it('creates a valid GenreRelevance with maximum value', () => {
      const result = GenreRelevance.create(MAX_GENRE_RELEVANCE)

      expect(result).toBeInstanceOf(GenreRelevance)
      if (result instanceof GenreRelevance) {
        expect(result.relevance).toBe(MAX_GENRE_RELEVANCE)
      }
    })

    it('creates a valid GenreRelevance with middle value', () => {
      const middleValue = Math.floor((MAX_GENRE_RELEVANCE + MIN_GENRE_RELEVANCE) / 2)
      const result = GenreRelevance.create(middleValue)

      expect(result).toBeInstanceOf(GenreRelevance)
      if (result instanceof GenreRelevance) {
        expect(result.relevance).toBe(middleValue)
      }
    })

    it('returns InvalidGenreRelevanceError when value is below minimum', () => {
      const result = GenreRelevance.create(MIN_GENRE_RELEVANCE - 1)

      expect(result).toBeInstanceOf(InvalidGenreRelevanceError)
      if (result instanceof InvalidGenreRelevanceError) {
        expect(result.relevance).toBe(MIN_GENRE_RELEVANCE - 1)
        expect(result.message).toBe(
          `Invalid genre relevance: ${MIN_GENRE_RELEVANCE - 1}. Must be an integer between ${MIN_GENRE_RELEVANCE} and ${MAX_GENRE_RELEVANCE} (inclusive)`,
        )
      }
    })

    it('returns InvalidGenreRelevanceError when value is above maximum', () => {
      const result = GenreRelevance.create(MAX_GENRE_RELEVANCE + 1)

      expect(result).toBeInstanceOf(InvalidGenreRelevanceError)
      if (result instanceof InvalidGenreRelevanceError) {
        expect(result.relevance).toBe(MAX_GENRE_RELEVANCE + 1)
        expect(result.message).toBe(
          `Invalid genre relevance: ${MAX_GENRE_RELEVANCE + 1}. Must be an integer between ${MIN_GENRE_RELEVANCE} and ${MAX_GENRE_RELEVANCE} (inclusive)`,
        )
      }
    })

    it('returns InvalidGenreRelevanceError for non-integer values', () => {
      const result = GenreRelevance.create(3.5)

      expect(result).toBeInstanceOf(InvalidGenreRelevanceError)
      if (result instanceof InvalidGenreRelevanceError) {
        expect(result.relevance).toBe(3.5)
        expect(result.message).toBe(
          `Invalid genre relevance: 3.5. Must be an integer between ${MIN_GENRE_RELEVANCE} and ${MAX_GENRE_RELEVANCE} (inclusive)`,
        )
      }
    })
  })
})
