import { ApplicationError } from './base.js'

export class PasswordResetTokenExpiredError extends ApplicationError {
  constructor() {
    super('PasswordResetTokenExpiredError', 'Password reset token has expired')
  }
}
