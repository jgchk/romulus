import { createDate, TimeSpan } from 'oslo'

import { type IAuthorizationService } from '../../domain/authorization.js'
import { PasswordResetToken } from '../../domain/entities/password-reset-token.js'
import { UnauthorizedError } from '../../domain/errors/unauthorized.js'
import { AuthenticationPermission } from '../../domain/permissions.js'
import { type AccountRepository } from '../../domain/repositories/account.js'
import { type HashRepository } from '../../domain/repositories/hash-repository.js'
import { type PasswordResetTokenRepository } from '../../domain/repositories/password-reset-token.js'
import { type TokenGenerator } from '../../domain/repositories/token-generator.js'
import { AccountNotFoundError } from '../errors/account-not-found.js'

export class RequestPasswordResetCommand {
  constructor(
    private passwordResetTokenRepo: PasswordResetTokenRepository,
    private passwordResetTokenGeneratorRepo: TokenGenerator,
    private passwordResetTokenHashRepo: HashRepository,
    private accountRepo: AccountRepository,
    private authorization: IAuthorizationService,
  ) {}

  async execute(
    accountId: number,
    requestorUserId: number,
  ): Promise<string | UnauthorizedError | AccountNotFoundError> {
    const hasPermission = await this.authorization.hasPermission(
      requestorUserId,
      AuthenticationPermission.RequestPasswordReset,
    )
    if (!hasPermission) return new UnauthorizedError()

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
