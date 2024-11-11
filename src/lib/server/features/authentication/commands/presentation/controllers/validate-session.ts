import type { ValidateSessionCommand } from '../../application/commands/validate-session'
import type { Permission } from '../../domain/entities/account'
import type { CookieCreator } from '../cookie'
import type { Cookie } from '../cookie'

export type ValidateSessionResult = {
  account:
    | {
        id: number
        username: string
        permissions: Set<Permission>
        genreRelevanceFilter: number
        showRelevanceTags: boolean
        showTypeTags: boolean
        showNsfw: boolean
        darkMode: boolean
      }
    | undefined
  cookie: Cookie | undefined
}

export class ValidateSessionController {
  constructor(
    private validateSessionCommand: ValidateSessionCommand,
    private cookieCreator: CookieCreator,
  ) {}

  async handle(sessionToken: string | undefined): Promise<ValidateSessionResult> {
    if (!sessionToken) {
      return { account: undefined, cookie: undefined }
    }

    const validateSessionResult = await this.validateSessionCommand.execute(sessionToken)

    if (validateSessionResult.userSession === undefined) {
      const cookie = this.cookieCreator.create(undefined)
      return { account: undefined, cookie }
    }

    if (validateSessionResult.userSession.status === 'refreshed') {
      const cookie = this.cookieCreator.create(validateSessionResult.userSession)
      return { account: validateSessionResult.userAccount, cookie }
    }

    return { account: validateSessionResult.userAccount, cookie: undefined }
  }
}
