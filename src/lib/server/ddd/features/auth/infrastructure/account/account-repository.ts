import type { CreatedAccount, NewAccount } from '../../domain/account'

export class NonUniqueUsernameError extends Error {
  constructor(public username: string) {
    super('Username is already taken')
  }
}

export type AccountRepository = {
  findById(id: number): Promise<CreatedAccount | undefined>
  findByUsername(username: string): Promise<CreatedAccount | undefined>
  create(account: NewAccount): Promise<number | NonUniqueUsernameError>
  update(id: number, account: NewAccount): Promise<void>
}
