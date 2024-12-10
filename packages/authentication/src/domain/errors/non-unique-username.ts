import { DomainError } from './base'

export class NonUniqueUsernameError extends DomainError {
  constructor(public username: string) {
    super('NonUniqueUsernameError', 'Username is already taken')
  }
}
