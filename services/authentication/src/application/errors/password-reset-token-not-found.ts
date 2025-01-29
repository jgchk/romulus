import { ApplicationError } from './base.js'

export class PasswordResetTokenNotFoundError extends ApplicationError {
  constructor() {
    super('PasswordResetTokenNotFoundError', 'Password reset token not found')
  }
}
