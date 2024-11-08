import { ApplicationError } from './base'

export class PasswordResetTokenNotFoundError extends ApplicationError {
  constructor() {
    super('PasswordResetTokenNotFoundError', 'Password reset token not found')
  }
}
