import { DomainError } from './base'

export class NonintegerDurationError extends DomainError {
  constructor(public readonly duration: number) {
    super('NonintegerDurationError', 'Duration must be an integer')
  }
}
