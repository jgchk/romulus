import { MAX_GENRE_RELEVANCE, MIN_GENRE_RELEVANCE } from '$lib/types/genres'

import { InvalidGenreRelevanceError } from './errors/invalid-genre-relevance'

export class GenreRelevance {
  private constructor(public readonly relevance: number) {}

  static create(relevance: number): GenreRelevance | InvalidGenreRelevanceError {
    const isInValidRange = relevance >= MIN_GENRE_RELEVANCE && relevance <= MAX_GENRE_RELEVANCE
    const isInteger = Number.isInteger(relevance)

    if (!isInValidRange || !isInteger) {
      return new InvalidGenreRelevanceError(relevance)
    }

    return new GenreRelevance(relevance)
  }
}
