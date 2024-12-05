import { CustomError } from '../../../shared/domain/errors'

export class ApplicationError extends CustomError {
  private readonly __tag = 'ApplicationError'

  constructor(name: string, message: string) {
    super(name, message)
  }
}
