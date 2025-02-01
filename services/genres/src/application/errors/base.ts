import { CustomError } from '@romulus/custom-error'

export class ApplicationError<Name extends string = string> extends CustomError<Name> {
  private readonly __tag = 'ApplicationError'

  constructor(name: Name, message: string) {
    super(name, message)
  }
}
