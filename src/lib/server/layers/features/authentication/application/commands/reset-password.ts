import type { HashRepository } from '../../../common/domain/repositories/hash'
import type { Cookie } from '../../domain/entities/cookie'
import type { PasswordResetToken } from '../../domain/entities/password-reset-token'
import { NewSession } from '../../domain/entities/session'
import type { AccountRepository } from '../../domain/repositories/account'
import type { PasswordResetTokenRepository } from '../../domain/repositories/password-reset-token'
import type { SessionRepository } from '../../domain/repositories/session'
import { AccountNotFoundError } from '../errors/account-not-found'

export class ResetPasswordCommand {
  constructor(
    private accountRepo: AccountRepository,
    private sessionRepo: SessionRepository,
    private passwordResetTokenRepo: PasswordResetTokenRepository,
    private passwordHashRepo: HashRepository,
  ) {}

  async execute(
    passwordResetToken: PasswordResetToken,
    newPassword: string,
  ): Promise<Cookie | AccountNotFoundError> {
    const account = await this.accountRepo.findById(passwordResetToken.accountId)
    if (!account) {
      return new AccountNotFoundError(passwordResetToken.accountId)
    }

    const updatedAccount = account.resetPassword(await this.passwordHashRepo.hash(newPassword))
    await this.accountRepo.update(passwordResetToken.accountId, updatedAccount)

    // Sign out the account everywhere
    await this.sessionRepo.deleteAllForAccount(passwordResetToken.accountId)

    await this.passwordResetTokenRepo.deleteByTokenHash(passwordResetToken.tokenHash)

    const session = await this.sessionRepo.create(new NewSession(account.id))

    const cookie = this.sessionRepo.createCookie(session.id)

    return cookie
  }
}
