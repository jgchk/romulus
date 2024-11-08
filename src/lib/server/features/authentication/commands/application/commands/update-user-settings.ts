import type { AccountRepository } from '../../domain/repositories/account'
import { AccountNotFoundError } from '../errors/account-not-found'

export type UpdateUserSettingsInput = {
  genreRelevanceFilter?: number
  showTypeTags?: boolean
  showRelevanceTags?: boolean
  darkMode?: boolean
  showNsfw?: boolean
}

export class UpdateUserSettingsCommand {
  constructor(private accountRepo: AccountRepository) {}

  async execute(
    accountId: number,
    settings: UpdateUserSettingsInput,
  ): Promise<void | AccountNotFoundError> {
    const account = await this.accountRepo.findById(accountId)
    if (!account) throw new AccountNotFoundError(accountId)

    const updatedAccount = account.updateSettings(settings)
    await this.accountRepo.update(accountId, updatedAccount)
  }
}
