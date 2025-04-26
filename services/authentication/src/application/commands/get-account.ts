import type { AccountRepository } from '../../domain/repositories/account.js'
import { AccountNotFoundError } from '../errors/account-not-found.js'

export class GetAccountQuery {
  constructor(private accountRepo: AccountRepository) {}

  async execute(accountId: number): Promise<
    | {
        id: number
        username: string
      }
    | AccountNotFoundError
  > {
    const account = await this.accountRepo.findById(accountId)
    if (!account) {
      return new AccountNotFoundError(accountId)
    }

    const accountOutput = {
      id: account.id,
      username: account.username,
    }

    return accountOutput
  }
}
