import type { RequestPasswordResetCommand } from '../../application/commands/request-password-reset'
import { AccountNotFoundError } from '../../application/errors/account-not-found'
import { UnauthorizedError } from '../../domain/errors/unauthorized'

export class RequestPasswordResetController {
  constructor(private requestPasswordResetCommand: RequestPasswordResetCommand) {}

  async handle(
    userAccount: { id: number },
    accountId: number,
  ): Promise<string | UnauthorizedError | AccountNotFoundError> {
    if (userAccount.id !== 1) {
      return new UnauthorizedError()
    }

    const passwordResetToken = await this.requestPasswordResetCommand.execute(accountId)
    if (passwordResetToken instanceof AccountNotFoundError) {
      return passwordResetToken
    }

    const passwordResetLink = 'https://www.romulus.lol/reset-password/' + passwordResetToken
    return passwordResetLink
  }
}
