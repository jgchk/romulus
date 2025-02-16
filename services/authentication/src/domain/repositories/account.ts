import type { CreatedAccount, NewAccount } from '../entities/account.js'
import type { NonUniqueUsernameError } from '../errors/non-unique-username.js'

export type AccountRepository = {
  findById(id: number): Promise<CreatedAccount | undefined>
  findByIds(ids: number[]): Promise<CreatedAccount[]>
  findByUsername(username: string): Promise<CreatedAccount | undefined>
  create(account: NewAccount): Promise<CreatedAccount | NonUniqueUsernameError>
  update(id: number, account: NewAccount): Promise<void>
  delete(id: number): Promise<void>
}
