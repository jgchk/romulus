import { ApplicationError } from './base'

export class NonexistentTrackError extends ApplicationError {
  constructor(
    public readonly index: number,
    public readonly id: number,
  ) {
    super('NonexistentTrackError', `Track with ID ${id} does not exist`)
  }
}
