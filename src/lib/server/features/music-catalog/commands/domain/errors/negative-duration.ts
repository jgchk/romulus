import { DomainError } from './base'

export class NegativeDurationError extends DomainError {
  constructor(public readonly duration: number) {
    super('NegativeDurationError', 'Duration cannot be negative')
  }
}
