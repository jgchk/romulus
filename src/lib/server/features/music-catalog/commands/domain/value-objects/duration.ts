import { NonintegerDurationError } from '../errors/duration-integer'
import { NegativeDurationError } from '../errors/negative-duration'

export class Duration {
  private constructor(public readonly value: number) {}

  static create(value: number): Duration | NonintegerDurationError | NegativeDurationError {
    if (value < 0) {
      return new NegativeDurationError(value)
    }

    if (value % 1 !== 0) {
      return new NonintegerDurationError(value)
    }

    return new Duration(value)
  }
}
