import { createDate, TimeSpan } from 'oslo'

import { PasswordResetToken } from '../../domain/entities/password-reset-token'
import type { AccountRepository } from '../../domain/repositories/account'
import type { HashRepository } from '../../domain/repositories/hash-repository'
import type { PasswordResetTokenRepository } from '../../domain/repositories/password-reset-token'
import type { TokenGenerator } from '../../domain/repositories/token-generator'
import { AccountNotFoundError } from '../errors/account-not-found'

export class RequestPasswordResetCommand {
  constructor(
    private passwordResetTokenRepo: PasswordResetTokenRepository,
    private passwordResetTokenGeneratorRepo: TokenGenerator,
    private passwordResetTokenHashRepo: HashRepository,
    private accountRepo: AccountRepository,
  ) {}

  async execute(accountId: number): Promise<string | AccountNotFoundError> {
    const account = await this.accountRepo.findById(accountId)
    if (account === undefined) {
      return new AccountNotFoundError(accountId)
    }

    await this.passwordResetTokenRepo.deleteByAccountId(accountId)

    const token = this.passwordResetTokenGeneratorRepo.generate(40)

    const passwordResetToken = new PasswordResetToken(
      accountId,
      await this.passwordResetTokenHashRepo.hash(token),
      createDate(new TimeSpan(2, 'h')),
    )

    await this.passwordResetTokenRepo.create(passwordResetToken)

    return token
  }
}
