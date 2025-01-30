import { DomainError } from './base.js'

export class GenreCycleError extends DomainError {
  constructor(public cycle: string) {
    super('GenreCycleError', `Cycle detected: ${cycle}`)
  }
}
