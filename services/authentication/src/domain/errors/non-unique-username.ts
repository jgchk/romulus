import { DomainError } from './base.js'

export class NonUniqueUsernameError extends DomainError {
  constructor(public username: string) {
    super('NonUniqueUsernameError', 'Username is already taken')
  }
}
