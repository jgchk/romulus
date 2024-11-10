import type { RegisterCommand } from '../../application/commands/register'
import { NonUniqueUsernameError } from '../../application/errors/non-unique-username'
import type { CookieCreator } from '../cookie'
import type { Cookie } from '../cookie'

export class RegisterController {
  constructor(
    private registerCommand: RegisterCommand,
    private cookieCreator: CookieCreator,
  ) {}

  async handle(username: string, password: string): Promise<Cookie | NonUniqueUsernameError> {
    const registerResult = await this.registerCommand.execute(username, password)

    if (registerResult instanceof NonUniqueUsernameError) {
      return registerResult
    }

    return this.cookieCreator.create(registerResult.newUserSession)
  }
}
