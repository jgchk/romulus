import { CustomError } from '$lib/utils/error'

export class MediaTypeTreeNotFoundError extends CustomError {
  constructor(public readonly id: string) {
    super('MediaTypeTreeNotFoundError', `Media type tree not found with id: ${id}`)
  }
}

export class UnauthorizedError extends CustomError {
  constructor() {
    super('UnauthorizedError', 'You are not authorized to perform this action')
  }
}
