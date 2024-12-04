import { CustomError } from '$lib/utils/error'

export class InfrastructureError extends CustomError {
  private readonly __tag = 'InfrastructureError'

  constructor(name: string, message: string) {
    super(name, message)
  }
}
