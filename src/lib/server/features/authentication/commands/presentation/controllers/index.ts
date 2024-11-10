import type { RegisterController } from './register'

export class AuthenticationController {
  constructor(private registerController: RegisterController) {}

  register(username: string, password: string) {
    return this.registerController.handle(username, password)
  }
}
