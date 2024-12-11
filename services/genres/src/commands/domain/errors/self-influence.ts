import { DomainError } from './base'

export class SelfInfluenceError extends DomainError {
  constructor() {
    super('SelfInfluenceError', 'A genre cannot influence itself')
  }
}
