import { MAX_GENRE_RELEVANCE, MIN_GENRE_RELEVANCE } from '$lib/types/genres'

import { DomainError } from './errors/base'

export class GenreRelevanceVote {
  constructor(
    public genreId: number,
    public accountId: number,
    public relevance: GenreRelevance,
  ) {}
}

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

export class InvalidGenreRelevanceError extends DomainError {
  constructor(public readonly relevance: number) {
    super(
      'InvalidGenreRelevanceError',
      `Invalid genre relevance: ${relevance}. Must be an integer between ${MIN_GENRE_RELEVANCE} and ${MAX_GENRE_RELEVANCE} (inclusive)`,
    )
  }
}
