import type { CreatedAccount, NewAccount } from '../entities/account.js'
import type { NonUniqueUsernameError } from '../errors/non-unique-username.js'

export type FindAllOptions = {
  limit?: number
  offset?: number
  username?: string
}

export type FindAllResult = {
  accounts: CreatedAccount[]
  total: number
}

export type AccountRepository = {
  findById(id: number): Promise<CreatedAccount | undefined>
  findByIds(ids: number[]): Promise<CreatedAccount[]>
  findByUsername(username: string): Promise<CreatedAccount | undefined>
  findAll(options?: FindAllOptions): Promise<FindAllResult>
  create(account: NewAccount): Promise<CreatedAccount | NonUniqueUsernameError>
  update(id: number, account: NewAccount): Promise<void>
  delete(id: number): Promise<void>
}
