import { InfrastructureError } from './base'

export class InvalidTokenLengthError extends InfrastructureError {
  constructor(public length: number) {
    super('InvalidTokenLengthError', `Invalid token length: ${length}. Must be a positive integer.`)
  }
}
