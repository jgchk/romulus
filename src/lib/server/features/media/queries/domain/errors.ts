import { CustomError } from '$lib/utils/error'

export class MediaTypeTreeNotFoundError extends CustomError {
  constructor(public readonly id: string) {
    super('MediaTypeTreeNotFoundError', `Media type tree not found with id: ${id}`)
  }
}
