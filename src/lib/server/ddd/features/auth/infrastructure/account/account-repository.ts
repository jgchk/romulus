import type { Account } from '../../domain/account'

export class NonUniqueUsernameError extends Error {
  constructor(public username: string) {
    super('Username is already taken')
  }
}

export type AccountRepository = {
  create(account: Account): Promise<number | NonUniqueUsernameError>
}
