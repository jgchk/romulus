import { ApplicationError } from './base'

export class GenreNotFoundError extends ApplicationError {
  constructor() {
    super('GenreNotFoundError', 'Genre not found')
  }
}
