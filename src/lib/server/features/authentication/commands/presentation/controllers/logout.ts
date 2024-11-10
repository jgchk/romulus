import type { LogoutCommand } from '../../application/commands/logout'
import type { CookieCreator } from '../cookie'
import type { Cookie } from '../cookie'

export class LogoutController {
  constructor(
    private logoutCommand: LogoutCommand,
    private cookieCreator: CookieCreator,
  ) {}

  async handle(sessionToken: string): Promise<Cookie> {
    await this.logoutCommand.execute(sessionToken)

    return this.cookieCreator.create(undefined)
  }
}
