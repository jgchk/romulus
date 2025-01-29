import { ApplicationError } from './base.js'

export class NonUniqueUsernameError extends ApplicationError {
  constructor(public username: string) {
    super('NonUniqueUsernameError', 'Username is already taken')
  }
}
