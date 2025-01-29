import { CustomError } from '@romulus/custom-error'

export class MediaTypeTreeNotFoundError extends CustomError {
  constructor(public readonly id: string) {
    super('MediaTypeTreeNotFoundError', `Media type tree not found with id: ${id}`)
  }
}
