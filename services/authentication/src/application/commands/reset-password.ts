import { Session } from '../../domain/entities/session.js'
import { type AccountRepository } from '../../domain/repositories/account.js'
import { type HashRepository } from '../../domain/repositories/hash-repository.js'
import { type PasswordResetTokenRepository } from '../../domain/repositories/password-reset-token.js'
import { type SessionRepository } from '../../domain/repositories/session.js'
import { type TokenGenerator } from '../../domain/repositories/token-generator.js'
import { AccountNotFoundError } from '../errors/account-not-found.js'
import { PasswordResetTokenExpiredError } from '../errors/password-reset-token-expired.js'
import { PasswordResetTokenNotFoundError } from '../errors/password-reset-token-not-found.js'

export type ResetPasswordResult = {
  userAccount: {
    id: number
  }
  userSession: {
    token: string
    expiresAt: Date
  }
}

export class ResetPasswordCommand {
  constructor(
    private accountRepo: AccountRepository,
    private sessionRepo: SessionRepository,
    private passwordResetTokenRepo: PasswordResetTokenRepository,
    private passwordResetTokenHashRepo: HashRepository,
    private passwordHashRepo: HashRepository,
    private sessionTokenHashRepo: HashRepository,
    private sessionTokenGenerator: TokenGenerator,
  ) {}

  async execute(
    passwordResetToken: string,
    newPassword: string,
  ): Promise<
    | ResetPasswordResult
    | PasswordResetTokenNotFoundError
    | PasswordResetTokenExpiredError
    | AccountNotFoundError
  > {
    const passwordResetTokenHash = await this.passwordResetTokenHashRepo.hash(passwordResetToken)
    const verifiedPasswordResetToken =
      await this.passwordResetTokenRepo.findByTokenHash(passwordResetTokenHash)
    if (!verifiedPasswordResetToken) {
      return new PasswordResetTokenNotFoundError()
    }
    if (verifiedPasswordResetToken.isExpired()) {
      return new PasswordResetTokenExpiredError()
    }

    const account = await this.accountRepo.findById(verifiedPasswordResetToken.accountId)
    if (!account) {
      return new AccountNotFoundError(verifiedPasswordResetToken.accountId)
    }

    const updatedAccount = account.resetPassword(await this.passwordHashRepo.hash(newPassword))
    await this.accountRepo.update(verifiedPasswordResetToken.accountId, updatedAccount)

    // Sign out the account everywhere
    await this.sessionRepo.deleteAllForAccount(verifiedPasswordResetToken.accountId)

    await this.passwordResetTokenRepo.deleteByTokenHash(verifiedPasswordResetToken.tokenHash)

    const token = this.sessionTokenGenerator.generate(20)

    const tokenHash = await this.sessionTokenHashRepo.hash(token)
    const session = new Session(
      account.id,
      tokenHash,
      new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
    )

    await this.sessionRepo.save(session)

    return {
      userAccount: { id: account.id },
      userSession: { token, expiresAt: session.expiresAt },
    }
  }
}
