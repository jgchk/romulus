import type { CreatedAccount, NewAccount } from '../../domain/account'

export class NonUniqueUsernameError extends Error {
  constructor(public username: string) {
    super('Username is already taken')
  }
}

export type AccountRepository = {
  findByUsername(username: string): Promise<CreatedAccount | undefined>
  create(account: NewAccount): Promise<number | NonUniqueUsernameError>
}
