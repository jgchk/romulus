import { DomainError } from './base'

export class InvalidTokenLengthError extends DomainError {
  constructor(public length: number) {
    super('InvalidTokenLength', `Invalid token length: ${length}. Must be a positive integer.`)
  }
}
