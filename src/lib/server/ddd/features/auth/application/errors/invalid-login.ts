import { ApplicationError } from './base'

export class InvalidLoginError extends ApplicationError {
  constructor() {
    super('InvalidLogin', 'Incorrect username or password')
  }
}
