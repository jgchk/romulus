export class CustomError<Name extends string = string> extends Error {
  public override readonly name: Name
  public override readonly cause?: Error

  constructor(name: Name, message: string, cause?: Error) {
    super(message, { cause })
    this.name = name

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }

    // Maintains proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export function toError(error: unknown): Error {
  if (error instanceof Error) return error
  if (typeof error === 'string') return new Error(error)
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return new Error(error.message)
  }
  return new Error(String(error))
}
