import { DomainError } from './base.js'

export class DerivedInfluenceError extends DomainError {
  constructor(public readonly childId: number) {
    super('DerivedInfluenceError', `A genre cannot be both derived and an influence`)
  }
}
