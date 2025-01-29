import { CustomError } from '../../domain/errors/base.js'

export class ApplicationError extends CustomError {
  private readonly __tag = 'ApplicationError'

  constructor(name: string, message: string) {
    super(name, message)
  }
}
