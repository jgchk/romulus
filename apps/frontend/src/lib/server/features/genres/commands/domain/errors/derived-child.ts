import { DomainError } from './base'

export class DerivedChildError extends DomainError {
  constructor(public readonly childId: number) {
    super('DerivedChildError', `A genre cannot be both derived and a child`)
  }
}
