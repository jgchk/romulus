import { MAX_GENRE_RELEVANCE, MIN_GENRE_RELEVANCE } from '../../../config'
import { DomainError } from './base'

export class InvalidGenreRelevanceError extends DomainError {
  constructor(public readonly relevance: number) {
    super(
      'InvalidGenreRelevanceError',
      `Invalid genre relevance: ${relevance}. Must be an integer between ${MIN_GENRE_RELEVANCE} and ${MAX_GENRE_RELEVANCE} (inclusive)`,
    )
  }
}
