import { CustomError } from '../../../shared/domain/errors'
import type { RequestPasswordResetCommand } from '../../application/commands/request-password-reset'
import type { ValidateSessionCommand } from '../../application/commands/validate-session'
import { AccountNotFoundError } from '../../application/errors/account-not-found'

export class RequestPasswordResetController {
  constructor(
    private validateSessionCommand: ValidateSessionCommand,
    private requestPasswordResetCommand: RequestPasswordResetCommand,
  ) {}

  async handle(
    sessionToken: string,
    accountId: number,
  ): Promise<string | UnauthorizedError | AccountNotFoundError> {
    const { userAccount } = await this.validateSessionCommand.execute(sessionToken)

    if (userAccount?.id !== 1) {
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

export class UnauthorizedError extends CustomError {
  constructor() {
    super('UnauthorizedError', 'You are not authorized to perform this action')
  }
}
