import { ApplicationError } from './base.js'

export class InvalidLoginError extends ApplicationError {
  constructor() {
    super('InvalidLogin', 'Incorrect username or password')
  }
}
