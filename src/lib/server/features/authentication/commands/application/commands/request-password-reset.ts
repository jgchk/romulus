import { createDate, TimeSpan } from 'oslo'

import type { HashRepository } from '../../../common/domain/repositories/hash'
import { PasswordResetToken } from '../../domain/entities/password-reset-token'
import { InvalidTokenLengthError } from '../../domain/errors/invalid-token-length'
import type { PasswordResetTokenRepository } from '../../domain/repositories/password-reset-token'
import type { TokenGenerator } from '../../domain/repositories/token-generator'

export class RequestPasswordResetCommand {
  constructor(
    private passwordResetTokenRepo: PasswordResetTokenRepository,
    private passwordResetTokenGeneratorRepo: TokenGenerator,
    private passwordResetTokenHashRepo: HashRepository,
  ) {}

  async execute(accountId: number): Promise<string> {
    await this.passwordResetTokenRepo.deleteByAccountId(accountId)

    const token = this.passwordResetTokenGeneratorRepo.generate(40)
    if (token instanceof InvalidTokenLengthError) {
      throw token // should never happen
    }

    const passwordResetToken = new PasswordResetToken(
      accountId,
      await this.passwordResetTokenHashRepo.hash(token),
      createDate(new TimeSpan(2, 'h')),
    )

    await this.passwordResetTokenRepo.create(passwordResetToken)

    return token
  }
}
