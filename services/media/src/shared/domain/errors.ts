export class CustomError extends Error {
  constructor(name: string, message: string) {
    super(message)
    this.name = name
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
