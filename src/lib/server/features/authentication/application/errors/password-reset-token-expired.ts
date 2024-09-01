import { ApplicationError } from './base'

export class PasswordResetTokenExpiredError extends ApplicationError {
  constructor() {
    super('PasswordResetTokenExpiredError', 'Password reset token has expired')
  }
}
