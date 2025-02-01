import { MAX_GENRE_RELEVANCE, MIN_GENRE_RELEVANCE } from '../../config.js'
import { DomainError } from './base.js'

export class InvalidGenreRelevanceError extends DomainError<'InvalidGenreRelevanceError'> {
  constructor(public readonly relevance: number) {
    super(
      'InvalidGenreRelevanceError',
      `Invalid genre relevance: ${relevance}. Must be an integer between ${MIN_GENRE_RELEVANCE} and ${MAX_GENRE_RELEVANCE} (inclusive)`,
    )
  }
}
