import { err, ok, type Result } from 'neverthrow'

import { MAX_GENRE_RELEVANCE, MIN_GENRE_RELEVANCE } from '../config.js'
import { InvalidGenreRelevanceError } from './errors/invalid-genre-relevance.js'

export class GenreRelevance {
  private constructor(public readonly relevance: number) {}

  static create(relevance: number): Result<GenreRelevance, InvalidGenreRelevanceError> {
    const isInValidRange = relevance >= MIN_GENRE_RELEVANCE && relevance <= MAX_GENRE_RELEVANCE
    const isInteger = Number.isInteger(relevance)

    if (!isInValidRange || !isInteger) {
      return err(new InvalidGenreRelevanceError(relevance))
    }

    return ok(new GenreRelevance(relevance))
  }
}
