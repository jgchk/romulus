import { CustomError } from './base.js'

export class UnauthorizedError extends CustomError {
  constructor() {
    super('UnauthorizedError', 'You are not authorized to perform this action')
  }
}
