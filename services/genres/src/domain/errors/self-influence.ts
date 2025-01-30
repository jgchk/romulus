import { DomainError } from './base.js'

export class SelfInfluenceError extends DomainError {
  constructor() {
    super('SelfInfluenceError', 'A genre cannot influence itself')
  }
}
