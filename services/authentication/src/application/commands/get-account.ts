import type { AccountRepository } from '../../domain/repositories/account'
import { AccountNotFoundError } from '../errors/account-not-found'

export class GetAccountCommand {
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
