import type { LoginCommand } from '../../application/commands/login'
import { InvalidLoginError } from '../../application/errors/invalid-login'
import type { CookieCreator } from '../cookie'
import type { Cookie } from '../cookie'

export class LoginController {
  constructor(
    private loginCommand: LoginCommand,
    private cookieCreator: CookieCreator,
  ) {}

  async handle(username: string, password: string): Promise<Cookie | InvalidLoginError> {
    const loginResult = await this.loginCommand.execute(username, password)

    if (loginResult instanceof InvalidLoginError) {
      return loginResult
    }

    return this.cookieCreator.create(loginResult.userSession)
  }
}
