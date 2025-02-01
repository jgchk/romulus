import { DomainError } from './base.js'

export class SelfInfluenceError extends DomainError<'SelfInfluenceError'> {
  constructor() {
    super('SelfInfluenceError', 'A genre cannot influence itself')
  }
}
