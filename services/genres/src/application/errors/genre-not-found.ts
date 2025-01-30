import { ApplicationError } from './base.js'

export class GenreNotFoundError extends ApplicationError {
  constructor() {
    super('GenreNotFoundError', 'Genre not found')
  }
}
