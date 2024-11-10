import type { LoginController } from './login'
import type { LogoutController } from './logout'
import type { RegisterController } from './register'

export class AuthenticationController {
  constructor(
    private loginController: LoginController,
    private logoutController: LogoutController,
    private registerController: RegisterController,
  ) {}

  login(username: string, password: string) {
    return this.loginController.handle(username, password)
  }

  logout(sessionToken: string) {
    return this.logoutController.handle(sessionToken)
  }

  register(username: string, password: string) {
    return this.registerController.handle(username, password)
  }
}
