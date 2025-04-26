import type { AccountRepository } from '../../domain/repositories/account.js'

export class GetAccountsQuery {
  constructor(private accountRepo: AccountRepository) {}

  async execute(ids: number[]): Promise<
    {
      id: number
      username: string
    }[]
  > {
    const accounts = await this.accountRepo.findByIds(ids)

    const accountsOutput = accounts.map((account) => ({
      id: account.id,
      username: account.username,
    }))

    return accountsOutput
  }
}
