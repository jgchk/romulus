export class CustomError extends Error {
  constructor(name: string, message: string) {
    super(message)
    this.name = name
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class DomainError extends CustomError {
  private readonly __tag = 'DomainError'

  constructor(name: string, message: string) {
    super(name, message)
  }
}
