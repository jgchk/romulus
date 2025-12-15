import type { AccountRepository, FindAllOptions } from '../../domain/repositories/account.js'

export type ListAccountsResult = {
  accounts: {
    id: number
    username: string
  }[]
  total: number
}

export class ListAccountsQuery {
  constructor(private accountRepo: AccountRepository) {}

  async execute(options?: FindAllOptions): Promise<ListAccountsResult> {
    const result = await this.accountRepo.findAll(options)

    return {
      accounts: result.accounts.map((account) => ({
        id: account.id,
        username: account.username,
      })),
      total: result.total,
    }
  }
}
