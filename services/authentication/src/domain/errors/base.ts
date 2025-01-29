import { CustomError } from '@romulus/custom-error'

export class DomainError extends CustomError {
  private readonly __tag = 'DomainError'

  constructor(name: string, message: string) {
    super(name, message)
  }
}
