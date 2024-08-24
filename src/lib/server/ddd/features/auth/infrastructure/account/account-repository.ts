import type { Account } from '../../domain/account'

export class NonUniqueUsernameError extends Error {
  constructor(public username: string) {
    super('Username is already taken')
  }
}

export type AccountRepository = {
  findByUsername(username: string): Promise<(Account & { id: number }) | undefined>
  create(account: Account): Promise<number | NonUniqueUsernameError>
}
