import { CustomError } from '@romulus/custom-error'

export class DomainError<Name extends string = string> extends CustomError<Name> {
  private readonly __tag = 'DomainError'

  constructor(name: Name, message: string) {
    super(name, message)
  }
}
