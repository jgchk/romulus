import { type IAuthorizationService } from '../../domain/authorization.js'
import { UnauthorizedError } from '../../domain/errors/unauthorized.js'
import { AuthenticationPermission } from '../../domain/permissions.js'
import { type AccountRepository } from '../../domain/repositories/account.js'

export class DeleteAccountCommand {
  constructor(
    private accountRepo: AccountRepository,
    private authorization: IAuthorizationService,
  ) {}

  async execute(id: number, requestorUserId: number): Promise<void | UnauthorizedError> {
    const hasPermission =
      id === requestorUserId ||
      (await this.authorization.hasPermission(
        requestorUserId,
        AuthenticationPermission.DeleteAccounts,
      ))
    if (!hasPermission) return new UnauthorizedError()

    await this.accountRepo.delete(id)
  }
}
