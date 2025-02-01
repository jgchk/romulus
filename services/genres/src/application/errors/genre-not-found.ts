import { ApplicationError } from './base.js'

export class GenreNotFoundError extends ApplicationError<'GenreNotFoundError'> {
  constructor() {
    super('GenreNotFoundError', 'Genre not found')
  }
}
