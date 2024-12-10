import { CustomError } from '../../../shared/domain/errors'

export class UnauthorizedError extends CustomError {
  constructor() {
    super('UnauthorizedError', 'You are not authorized to perform this action')
  }
}
