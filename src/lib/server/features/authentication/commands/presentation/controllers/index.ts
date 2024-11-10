import type { LoginController } from './login'
import type { RegisterController } from './register'

export class AuthenticationController {
  constructor(
    private loginController: LoginController,
    private registerController: RegisterController,
  ) {}

  login(username: string, password: string) {
    return this.loginController.handle(username, password)
  }

  register(username: string, password: string) {
    return this.registerController.handle(username, password)
  }
}
