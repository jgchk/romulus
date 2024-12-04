import type { NonintegerDurationError } from '../../domain/errors/duration-integer'
import type { NegativeDurationError } from '../../domain/errors/negative-duration'
import { ApplicationError } from './base'

export class InvalidTrackError extends ApplicationError {
  constructor(
    public readonly index: number,
    public readonly originalError: NonintegerDurationError | NegativeDurationError,
  ) {
    super('InvalidTrackError', `Invalid track at index ${index}: ${originalError.message}`)
  }
}
