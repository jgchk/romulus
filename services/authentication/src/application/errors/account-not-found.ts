import { ApplicationError } from './base.js'

export class AccountNotFoundError extends ApplicationError {
  constructor(public accountId: number) {
    super('AccountNotFoundError', 'Account not found')
  }
}
